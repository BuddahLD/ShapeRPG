/**
 * Presentation Service: GameStateManager Singleton
 * Provides single instance of GameStateManager to all components
 */

import { GameStateManager } from './managers/GameStateManager';
import { AppBootstrapService } from '../application/AppBootstrapService';

class GameStateService {
  private static instance: GameStateManager | null = null;

  static getInstance(): GameStateManager {
    if (!this.instance) {
      const appBootstrap = AppBootstrapService.getInstance();
      const gameStateService = appBootstrap.getGameStateService();
      const animationService = appBootstrap.getAnimationService();
      
      this.instance = new GameStateManager(gameStateService, animationService);
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

export { GameStateService };
