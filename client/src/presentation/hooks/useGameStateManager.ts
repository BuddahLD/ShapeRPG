/**
 * Presentation Hook: Game State Manager Integration
 * Provides React hooks for accessing the GameStateManager
 */

import { useEffect, useRef } from 'react';
import { GameStateManager } from '../managers/GameStateManager';
import { AppBootstrap } from '../../application/AppBootstrap';

let gameStateManagerInstance: GameStateManager | null = null;

export function useGameStateManager() {
  const managerRef = useRef<GameStateManager | null>(null);

  useEffect(() => {
    if (!managerRef.current) {
      // Initialize clean architecture bootstrap
      const appBootstrap = AppBootstrap.createDevelopmentApp();
      const gameStateService = appBootstrap.getGameStateService();
      const animationService = appBootstrap.getAnimationService();
      
      // Create manager instance
      managerRef.current = new GameStateManager(gameStateService, animationService);
      gameStateManagerInstance = managerRef.current;
    }
  }, []);

  return managerRef.current;
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
      movePlayer: async () => {},
      clearError: () => {},
      currentLocation: 'LOC_HUB_FIGUREIUM',
      isDrawingRune: false
    };
  }

  // Use the Zustand hook pattern to get reactive state and actions
  const store = manager.getStore();
  return store.getState();
}