/**
 * Application Service: Game State Management
 * Coordinates game state changes and business workflows
 */

import { Player } from '../../domain/entities/Player';
import { Mob } from '../../domain/entities/Mob';
import { WorldArea } from '../../domain/valueObjects/WorldArea';
import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';
import { ISpellRepository } from '../../domain/interfaces/repositories/ISpellRepository';
import { PlayerMovementUseCase } from '../useCases/PlayerMovementUseCase';
import { WorldExplorationUseCase } from '../useCases/WorldExplorationUseCase';
import { SpellCastingUseCase } from '../useCases/SpellCastingUseCase';
import { ZoneDetectionService } from './ZoneDetectionService';
import { ShapeMatchingService, ShapeMatchResult } from '../../domain/services/ShapeMatchingService';

export interface GameState {
  readonly player: Player | null;
  readonly currentArea: WorldArea | null;
  readonly nearbyMobs: Mob[];
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
    nearbyMobs: [],
    isInCombat: false,
    isDrawingRune: false,
    gamePhase: 'loading'
  };

  private readonly zoneDetectionService: ZoneDetectionService;

  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly worldRepository: IWorldRepository,
    private readonly spellRepository: ISpellRepository,
    private readonly playerMovementUseCase: PlayerMovementUseCase,
    private readonly worldExplorationUseCase: WorldExplorationUseCase,
    private readonly spellCastingUseCase: SpellCastingUseCase
  ) {
    this.zoneDetectionService = new ZoneDetectionService(worldRepository);
  }

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
        nearbyMobs: [],
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

  updatePlayer(updatedPlayer: Player): void {
    this.currentGameState = {
      ...this.currentGameState,
      player: updatedPlayer
    };
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
      ['SPL01'] // starting spells - Fire Bolt (triangle)
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
    if (explorationResult.currentArea?.allowsMobSpawning && this.currentGameState.nearbyMobs.length > 0) {
      const hasLivingMobs = this.currentGameState.nearbyMobs.some(mob => mob.isAlive());
      if (hasLivingMobs) {
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
    // Update mob states
    const updatedMobs = this.currentGameState.nearbyMobs.map(mob => 
      mob.updateCounterWindow(deltaTime)
    );

    this.currentGameState = {
      ...this.currentGameState,
      nearbyMobs: updatedMobs
    };

    // Check if combat should end
    const hasLivingMobs = updatedMobs.some(mob => mob.isAlive());
    if (!hasLivingMobs) {
      this.currentGameState = {
        ...this.currentGameState,
        isInCombat: false,
        gamePhase: 'exploring',
        nearbyMobs: []
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

  /**
   * Detect zone changes based on player position
   * This method should be called when the player position changes
   */
  async detectZoneChange(playerPosition: { x: number; y: number }): Promise<boolean> {
    const detectionResult = await this.zoneDetectionService.detectZone({
      playerPosition
    });

    if (detectionResult.success && detectionResult.areaChanged) {
      // Update current area in game state
      this.currentGameState = {
        ...this.currentGameState,
        currentArea: detectionResult.currentArea
      };
      return true;
    }

    return false;
  }

  /**
   * Clear enemies in the current area
   */
  async clearEnemiesInCurrentArea(): Promise<void> {
    if (this.currentGameState.currentArea) {
      await this.worldRepository.clearMobsInArea(this.currentGameState.currentArea.id);
      
      // Update game state
      this.currentGameState = {
        ...this.currentGameState,
        nearbyMobs: []
      };
    }
  }

  /**
   * Spawn mobs in the current area
   */
  async spawnMobsInCurrentArea(): Promise<void> {
    if (this.currentGameState.currentArea && this.currentGameState.currentArea.allowsMobSpawning) {
      // Get existing mobs in the area
      const existingMobs = await this.worldRepository.getMobsInArea(this.currentGameState.currentArea.id);
      
      // Update game state with mobs
      this.currentGameState = {
        ...this.currentGameState,
        nearbyMobs: existingMobs
      };
    }
  }

  /**
   * Set the game phase
   */
  setGamePhase(phase: 'loading' | 'exploring' | 'combat' | 'rune-drawing' | 'paused'): void {
    this.currentGameState = {
      ...this.currentGameState,
      gamePhase: phase
    };
  }

  /**
   * Cast a spell based on shape matching result
   */
  async castSpell(matchResult: ShapeMatchResult): Promise<void> {
    if (!this.currentGameState.player) {
      console.warn('Cannot cast spell: No player found');
      return;
    }

    const player = this.currentGameState.player;

    if (matchResult.spellId && matchResult.isKnownPattern) {
      // Cast known spell
      try {
        const result = await this.spellCastingUseCase.castSpell({
          playerId: player.id,
          spellId: matchResult.spellId,
          accuracy: matchResult.accuracy
        });

        if (result.success && result.updatedPlayer) {
          // Update player state
          this.currentGameState = {
            ...this.currentGameState,
            player: result.updatedPlayer
          };
          console.log(`Successfully cast ${matchResult.spellId} with ${Math.round(matchResult.accuracy * 100)}% accuracy`);
        } else {
          console.warn('Spell casting failed:', result.errorMessage);
        }
      } catch (error) {
        console.error('Error casting spell:', error);
      }
    } else {
      // Apply debuff for failed pattern matching
      this.applyDebuff(matchResult.debuffType || 'self_damage');
    }
  }

  /**
   * Apply debuff to player
   */
  private applyDebuff(debuffType: 'self_damage' | 'slow_player' | 'screen_blackout' | 'weakness'): void {
    if (!this.currentGameState.player) return;

    const player = this.currentGameState.player;
    let updatedPlayer = player;

    switch (debuffType) {
      case 'self_damage':
        updatedPlayer = player.takeDamage(5);
        console.log('Applied self damage debuff: -5 HP');
        break;
      case 'slow_player':
        // TODO: Implement speed debuff
        console.log('Applied slow player debuff');
        break;
      case 'screen_blackout':
        // TODO: Implement screen blackout
        console.log('Applied screen blackout debuff');
        break;
      case 'weakness':
        // TODO: Implement weakness debuff
        console.log('Applied weakness debuff');
        break;
    }

    this.currentGameState = {
      ...this.currentGameState,
      player: updatedPlayer
    };
  }
}