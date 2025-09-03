/**
 * Presentation Manager: Game State Management
 * Manages UI state and bridges clean architecture to presentation layer
 */

import { create } from 'zustand';
import { GameStateService, GameState } from '../../application/services/GameStateService';
import { AnimationService } from '../../application/services/AnimationService';
import { Player } from '../../domain/entities/Player';
import { WorldArea } from '../../domain/valueObjects/WorldArea';
import { Enemy } from '../../domain/entities/Enemy';

// UI Models for presentation layer
export interface UIPlayerModel {
  readonly id: string;
  readonly position: { x: number; y: number };
  readonly stats: {
    readonly hp: number;
    readonly maxHp: number;
    readonly mana: number;
    readonly maxMana: number;
    readonly attack: number;
    readonly defense: number;
  };
  readonly level: number;
  readonly experience: number;
  readonly gold: number;
  readonly knownSpells: string[];
}

export interface UIAreaModel {
  readonly id: string;
  readonly name: string;
  readonly bounds: { minX: number; maxX: number; minY: number; maxY: number };
  readonly gamePhase: string;
  readonly visualTheme: {
    readonly primary: string;
    readonly secondary: string;
    readonly accent: string;
    readonly background: string;
  };
  readonly backgroundGradient: string;
}

export interface UIGameState {
  readonly player: UIPlayerModel | null;
  readonly currentArea: UIAreaModel | null;
  readonly isInCombat: boolean;
  readonly isDrawingRune: boolean;
  readonly gamePhase: string;
  readonly isLoading: boolean;
  readonly error: string | null;
}

// Store interface following existing patterns
interface GameStateStore {
  // State
  gameState: UIGameState;
  
  // Actions
  initializeGame: (playerId?: string) => Promise<void>;
  updateGameState: (deltaTime: number) => Promise<void>;
  setDrawingRune: (isDrawing: boolean) => void;
  movePlayer: (deltaX: number, deltaY: number) => Promise<void>;
  clearError: () => void;
  
  // Getters for backward compatibility
  currentLocation: string;
  isDrawingRune: boolean;
}

export class GameStateManager {
  private gameStateService: GameStateService;
  private animationService: AnimationService;
  private store: any;

  constructor(gameStateService: GameStateService, animationService: AnimationService) {
    this.gameStateService = gameStateService;
    this.animationService = animationService;
    this.createStore();
  }

  private createStore() {
    this.store = create<GameStateStore>((set, get) => ({
      // Initial state
      gameState: {
        player: null,
        currentArea: null,
        isInCombat: false,
        isDrawingRune: false,
        gamePhase: 'loading',
        isLoading: false,
        error: null
      },

      // Actions
      initializeGame: async (playerId?: string) => {
        set(state => ({ 
          gameState: { ...state.gameState, isLoading: true, error: null }
        }));

        try {
          const result = await this.gameStateService.initializeGame({ playerId });
          
          if (result.success) {
            const uiGameState = this.adaptGameStateToUI(result.gameState);
            set({ gameState: uiGameState });
          } else {
            set(state => ({
              gameState: { 
                ...state.gameState, 
                isLoading: false, 
                error: 'Failed to initialize game' 
              }
            }));
          }
        } catch (error) {
          set(state => ({
            gameState: { 
              ...state.gameState, 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          }));
        }
      },

      updateGameState: async (deltaTime: number) => {
        const currentState = get();
        if (!currentState.gameState.player) return;

        try {
          const result = await this.gameStateService.updateGameState({
            playerId: currentState.gameState.player.id,
            deltaTime
          });

          if (result.success) {
            const uiGameState = this.adaptGameStateToUI(result.gameState);
            set({ gameState: uiGameState });
          }
        } catch (error) {
          console.warn('Failed to update game state:', error);
        }
      },

      setDrawingRune: (isDrawing: boolean) => {
        this.gameStateService.setDrawingRune(isDrawing);
        const updatedGameState = this.gameStateService.getCurrentGameState();
        const uiGameState = this.adaptGameStateToUI(updatedGameState);
        set({ gameState: uiGameState });
      },

      movePlayer: async (deltaX: number, deltaY: number) => {
        const currentState = get();
        if (!currentState.gameState.player) return;

        try {
          // Calculate new position based on current position + movement delta
          const currentPos = currentState.gameState.player.position;
          const newPosition = {
            x: currentPos.x + deltaX * 2, // Scale movement speed
            y: currentPos.y + deltaY * 2
          };

          // Use the Player entity's moveTo method to create a new player instance
          const updatedPlayer = currentState.gameState.player.moveTo(newPosition);

          // Update player in the store
          set(state => ({
            gameState: {
              ...state.gameState,
              player: updatedPlayer
            }
          }));

          console.log('Player moved to:', newPosition);
        } catch (error) {
          console.warn('Failed to move player:', error);
        }
      },

      clearError: () => {
        set(state => ({
          gameState: { ...state.gameState, error: null }
        }));
      },

      // Backward compatibility getters
      get currentLocation() {
        return get().gameState.currentArea?.id || 'LOC_HUB_FIGUREIUM';
      },

      get isDrawingRune() {
        return get().gameState.isDrawingRune;
      }
    }));
  }

  getStore() {
    return this.store;
  }

  // Adapters to convert domain models to UI models
  private adaptGameStateToUI(gameState: GameState): UIGameState {
    return {
      player: gameState.player ? this.adaptPlayerToUI(gameState.player) : null,
      currentArea: gameState.currentArea ? this.adaptAreaToUI(gameState.currentArea) : null,
      isInCombat: gameState.isInCombat,
      isDrawingRune: gameState.isDrawingRune,
      gamePhase: gameState.gamePhase,
      isLoading: false,
      error: null
    };
  }

  private adaptPlayerToUI(player: Player): UIPlayerModel {
    return {
      id: player.id,
      position: player.position,
      stats: {
        hp: player.stats.hp,
        maxHp: player.stats.maxHp,
        mana: player.stats.mana,
        maxMana: player.stats.maxMana,
        attack: player.stats.attack,
        defense: player.stats.defense
      },
      level: player.level,
      experience: player.experience,
      gold: player.gold,
      knownSpells: Array.from(player.knownSpells)
    };
  }

  private adaptAreaToUI(area: WorldArea): UIAreaModel {
    return {
      id: area.id,
      name: area.name,
      bounds: area.bounds,
      gamePhase: area.gamePhase,
      visualTheme: area.visualTheme,
      backgroundGradient: area.backgroundGradient
    };
  }
}