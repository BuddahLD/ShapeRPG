/**
 * Application Service: Game State Management
 * Coordinates game state changes and business workflows
 */

import { Player } from '../../domain/entities/Player';
import { Enemy } from '../../domain/entities/Enemy';
import { WorldArea } from '../../domain/valueObjects/WorldArea';
import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';
import { PlayerMovementUseCase } from '../useCases/PlayerMovementUseCase';
import { WorldExplorationUseCase } from '../useCases/WorldExplorationUseCase';

export interface GameState {
  readonly player: Player | null;
  readonly currentArea: WorldArea | null;
  readonly nearbyEnemies: Enemy[];
  readonly isInCombat: boolean;
  readonly isDrawingRune: boolean;
  readonly gamePhase: 'loading' | 'exploring' | 'combat' | 'rune-drawing' | 'paused';
}

export interface InitializeGameRequest {
  readonly playerId?: string;
}

export interface InitializeGameResponse {
  readonly success: boolean;
  readonly gameState: GameState;
  readonly isNewGame: boolean;
}

export interface UpdateGameStateRequest {
  readonly playerId: string;
  readonly deltaTime: number;
}

export interface UpdateGameStateResponse {
  readonly success: boolean;
  readonly gameState: GameState;
  readonly stateChanges: string[];
}

export class GameStateService {
  private currentGameState: GameState = {
    player: null,
    currentArea: null,
    nearbyEnemies: [],
    isInCombat: false,
    isDrawingRune: false,
    gamePhase: 'loading'
  };

  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly worldRepository: IWorldRepository,
    private readonly playerMovementUseCase: PlayerMovementUseCase,
    private readonly worldExplorationUseCase: WorldExplorationUseCase
  ) {}

  async initializeGame(request: InitializeGameRequest): Promise<InitializeGameResponse> {
    try {
      let player: Player;
      let isNewGame = false;

      // Try to load existing player or create new one
      if (request.playerId) {
        const existingPlayer = await this.playerRepository.findById(request.playerId);
        if (existingPlayer) {
          player = existingPlayer;
        } else {
          player = this.createNewPlayer(request.playerId);
          isNewGame = true;
        }
      } else {
        const playerId = `player_${Date.now()}`;
        player = this.createNewPlayer(playerId);
        isNewGame = true;
      }

      // Get initial world state
      const allAreas = await this.worldRepository.getAllAreas();
      const currentArea = this.findAreaForPlayer(allAreas, player);

      // Initialize game state
      this.currentGameState = {
        player,
        currentArea,
        nearbyEnemies: [],
        isInCombat: false,
        isDrawingRune: false,
        gamePhase: 'exploring'
      };

      // Save player if new
      if (isNewGame) {
        await this.playerRepository.save(player);
      }

      return {
        success: true,
        gameState: this.currentGameState,
        isNewGame
      };
    } catch (error) {
      return {
        success: false,
        gameState: this.currentGameState,
        isNewGame: false
      };
    }
  }

  async updateGameState(request: UpdateGameStateRequest): Promise<UpdateGameStateResponse> {
    const stateChanges: string[] = [];

    try {
      // Get current player
      const player = await this.playerRepository.findById(request.playerId);
      if (!player) {
        throw new Error(`Player not found: ${request.playerId}`);
      }

      // Update game state based on current phase
      switch (this.currentGameState.gamePhase) {
        case 'exploring':
          await this.updateExplorationState(player, request.deltaTime, stateChanges);
          break;
          
        case 'combat':
          await this.updateCombatState(player, request.deltaTime, stateChanges);
          break;
          
        case 'rune-drawing':
          await this.updateRuneDrawingState(player, request.deltaTime, stateChanges);
          break;
      }

      // Update player in current state
      this.currentGameState = {
        ...this.currentGameState,
        player
      };

      return {
        success: true,
        gameState: this.currentGameState,
        stateChanges
      };
    } catch (error) {
      return {
        success: false,
        gameState: this.currentGameState,
        stateChanges: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  setDrawingRune(isDrawing: boolean): void {
    this.currentGameState = {
      ...this.currentGameState,
      isDrawingRune: isDrawing,
      gamePhase: isDrawing ? 'rune-drawing' : 
                  this.currentGameState.isInCombat ? 'combat' : 'exploring'
    };
  }

  getCurrentGameState(): GameState {
    return this.currentGameState;
  }

  private createNewPlayer(playerId: string): Player {
    return new Player(
      playerId,
      { x: 0, y: 0 }, // Start at hub center
      {
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        attack: 10,
        defense: 5,
        castSpeed: 1.0
      },
      1, // level
      0, // experience
      100, // starting gold
      ['fire-bolt', 'ice-shard', 'shield-aura'] // starting spells
    );
  }

  private findAreaForPlayer(areas: WorldArea[], player: Player): WorldArea | null {
    return areas.find(area => area.containsPosition(player.position.x, player.position.y)) || null;
  }

  private async updateExplorationState(
    player: Player, 
    deltaTime: number, 
    stateChanges: string[]
  ): Promise<void> {
    // Check for area transitions
    const explorationResult = await this.worldExplorationUseCase.exploreWorld({
      playerId: player.id,
      playerPosition: player.position,
      loadRadius: 2
    });

    if (explorationResult.currentArea?.id !== this.currentGameState.currentArea?.id) {
      stateChanges.push(`Area changed to: ${explorationResult.currentArea?.name || 'Unknown'}`);
      this.currentGameState = {
        ...this.currentGameState,
        currentArea: explorationResult.currentArea
      };
    }

    // Check for combat initiation
    if (explorationResult.currentArea?.allowsEnemySpawning && this.currentGameState.nearbyEnemies.length > 0) {
      const hasLivingEnemies = this.currentGameState.nearbyEnemies.some(enemy => enemy.isAlive());
      if (hasLivingEnemies) {
        this.currentGameState = {
          ...this.currentGameState,
          isInCombat: true,
          gamePhase: 'combat'
        };
        stateChanges.push('Combat initiated');
      }
    }
  }

  private async updateCombatState(
    player: Player, 
    deltaTime: number, 
    stateChanges: string[]
  ): Promise<void> {
    // Update enemy states
    const updatedEnemies = this.currentGameState.nearbyEnemies.map(enemy => 
      enemy.updateCounterWindow(deltaTime)
    );

    this.currentGameState = {
      ...this.currentGameState,
      nearbyEnemies: updatedEnemies
    };

    // Check if combat should end
    const hasLivingEnemies = updatedEnemies.some(enemy => enemy.isAlive());
    if (!hasLivingEnemies) {
      this.currentGameState = {
        ...this.currentGameState,
        isInCombat: false,
        gamePhase: 'exploring',
        nearbyEnemies: []
      };
      stateChanges.push('Combat ended');
    }
  }

  private async updateRuneDrawingState(
    player: Player, 
    deltaTime: number, 
    stateChanges: string[]
  ): Promise<void> {
    // Rune drawing state is managed externally
    // This method could handle timeouts or other rune-drawing logic
  }
}