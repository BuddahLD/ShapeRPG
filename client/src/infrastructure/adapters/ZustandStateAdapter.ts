/**
 * Infrastructure: Zustand State Management Adapter
 * Adapts clean architecture to existing Zustand store pattern
 */

import { create } from 'zustand';
import { Player } from '../../domain/entities/Player';
import { WorldArea } from '../../domain/valueObjects/WorldArea';
import { Enemy } from '../../domain/entities/Enemy';
import { GameStateService, GameState } from '../../application/services/GameStateService';

// Adapter interface for Zustand stores
export interface GameStateStore {
  // State
  gameState: GameState;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeGame: (playerId?: string) => Promise<void>;
  updateGameState: (deltaTime: number) => Promise<void>;
  setDrawingRune: (isDrawing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export class ZustandStateAdapter {
  constructor(private gameStateService: GameStateService) {}

  createGameStateStore() {
    return create<GameStateStore>((set, get) => ({
      // Initial state
      gameState: {
        player: null,
        currentArea: null,
        nearbyEnemies: [],
        isInCombat: false,
        isDrawingRune: false,
        gamePhase: 'loading'
      },
      isLoading: false,
      error: null,

      // Actions
      initializeGame: async (playerId?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await this.gameStateService.initializeGame({ playerId });
          
          if (result.success) {
            set({ 
              gameState: result.gameState, 
              isLoading: false 
            });
          } else {
            set({ 
              error: 'Failed to initialize game', 
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error', 
            isLoading: false 
          });
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
            set({ 
              gameState: result.gameState,
              error: null
            });
          } else {
            set({ error: 'Failed to update game state' });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      },

      setDrawingRune: (isDrawing: boolean) => {
        this.gameStateService.setDrawingRune(isDrawing);
        const updatedGameState = this.gameStateService.getCurrentGameState();
        set({ gameState: updatedGameState });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      reset: () => {
        set({
          gameState: {
            player: null,
            currentArea: null,
            nearbyEnemies: [],
            isInCombat: false,
            isDrawingRune: false,
            gamePhase: 'loading'
          },
          isLoading: false,
          error: null
        });
      }
    }));
  }

  // Helper methods to adapt domain objects to store format
  adaptPlayerForStore(player: Player) {
    return {
      id: player.id,
      position: player.position,
      stats: player.stats,
      level: player.level,
      experience: player.experience,
      gold: player.gold,
      knownSpells: Array.from(player.knownSpells)
    };
  }

  adaptAreaForStore(area: WorldArea | null) {
    if (!area) return null;
    
    return {
      id: area.id,
      name: area.name,
      bounds: area.bounds,
      gamePhase: area.gamePhase,
      visualTheme: area.visualTheme,
      allowsEnemySpawning: area.allowsEnemySpawning,
      backgroundGradient: area.backgroundGradient
    };
  }

  adaptEnemyForStore(enemy: Enemy) {
    return {
      id: enemy.id,
      type: enemy.type,
      position: enemy.position,
      stats: enemy.stats,
      isAttacking: enemy.isAttacking,
      counterWindow: enemy.counterWindow
    };
  }
}