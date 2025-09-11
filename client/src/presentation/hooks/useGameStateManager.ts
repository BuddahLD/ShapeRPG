/**
 * Presentation Hook: Game State Manager Integration
 * Provides React hooks for accessing the GameStateManager
 */

import { GameStateService } from '../GameStateService';

export function useGameStateManager() {
  // Use singleton GameStateManager instance
  return GameStateService.getInstance();
}

// Hook for accessing the game state store
export function useGameState() {
  const manager = useGameStateManager();
  
  if (!manager) {
    // Return default state while manager initializes
    return {
      gameState: {
        player: null,
        currentArea: null,
        isInCombat: false,
        isDrawingRune: false,
        gamePhase: 'loading',
        isLoading: true,
        error: null
      },
      initializeGame: async () => {},
      updateGameState: async () => {},
      setDrawingRune: () => {},
      castSpell: async () => {},
      movePlayer: async () => {},
      clearError: () => {},
      currentLocation: 'LOC_HUB_FIGUREIUM',
      isDrawingRune: false,
      enemies: []
    };
  }

  // Use the Zustand hook pattern to get reactive state and actions
  const store = manager.getStore();
  const state = store();
  
  // Extract data from gameState and provide backward compatibility
  return {
    ...state,
    currentLocation: state.gameState.currentArea?.id || 'LOC_HUB_FIGUREIUM',
    isDrawingRune: state.gameState.isDrawingRune,
    mobs: state.gameState.nearbyMobs || []
  };
}