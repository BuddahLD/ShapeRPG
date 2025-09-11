/**
 * Application Bootstrap: Clean Architecture Dependency Injection
 * Wires up all dependencies following clean architecture principles
 */

import { RepositoryFactory } from '../infrastructure/factories/RepositoryFactory';
import { CombatServiceImpl } from '../infrastructure/services/CombatServiceImpl';
import { InMemorySpellRepository } from '../infrastructure/persistence/InMemorySpellRepository';
// ZustandStateAdapter removed - using GameStateManager directly
import { PlayerMovementUseCase } from './useCases/PlayerMovementUseCase';
import { WorldExplorationUseCase } from './useCases/WorldExplorationUseCase';
import { CombatUseCase } from './useCases/CombatUseCase';
import { SpellCastingUseCase } from './useCases/SpellCastingUseCase';
import { GameStateService } from './services/GameStateService';
import { AnimationService } from './services/AnimationService';
import { MinimapService } from './services/MinimapService';
import { MobManager } from './services/MobManager';

export interface AppConfig {
  readonly environment: 'development' | 'production';
  readonly persistence: 'memory' | 'localStorage';
}

export class AppBootstrap {
  private static instance: AppBootstrap | null = null;
  
  private gameStateService!: GameStateService;
  private animationService!: AnimationService;
  private minimapService!: MinimapService;
  private mobManager!: MobManager;
  // ZustandStateAdapter removed - using GameStateManager directly
  
  private constructor(private config: AppConfig) {
    this.initializeDependencies();
  }

  static getInstance(config: AppConfig): AppBootstrap {
    if (!this.instance) {
      this.instance = new AppBootstrap(config);
    }
    return this.instance;
  }

  getGameStateService(): GameStateService {
    return this.gameStateService;
  }

  getAnimationService(): AnimationService {
    return this.animationService;
  }

  getMinimapService(): MinimapService {
    return this.minimapService;
  }

  getMobManager(): MobManager {
    return this.mobManager;
  }

  // ZustandStateAdapter removed - using GameStateManager directly

  private initializeDependencies(): void {
    // Create repositories (Infrastructure layer)
    const repositories = this.config.environment === 'development'
      ? RepositoryFactory.createDevelopmentRepositories()
      : RepositoryFactory.createProductionRepositories();

    // Create spell repository
    const spellRepository = new InMemorySpellRepository();

    // Create services (Infrastructure layer)
    const combatService = new CombatServiceImpl();

    // Create use cases (Application layer)
    const playerMovementUseCase = new PlayerMovementUseCase(
      repositories.playerRepository,
      repositories.worldRepository
    );

    const worldExplorationUseCase = new WorldExplorationUseCase(
      repositories.playerRepository,
      repositories.worldRepository
    );

    const combatUseCase = new CombatUseCase(
      repositories.playerRepository,
      combatService
    );

    const spellCastingUseCase = new SpellCastingUseCase(
      repositories.playerRepository,
      combatService,
      spellRepository
    );

    // Create application services (Application layer)
    this.gameStateService = new GameStateService(
      repositories.playerRepository,
      repositories.worldRepository,
      spellRepository,
      playerMovementUseCase,
      worldExplorationUseCase,
      spellCastingUseCase
    );

    this.animationService = new AnimationService();

    this.minimapService = new MinimapService(repositories.worldRepository);

    this.mobManager = new MobManager();

    // ZustandStateAdapter removed - using GameStateManager directly
  }

  // Factory methods for common configurations
  static createDevelopmentApp(): AppBootstrap {
    return AppBootstrap.getInstance({
      environment: 'development',
      persistence: 'memory'
    });
  }

  static createProductionApp(): AppBootstrap {
    return AppBootstrap.getInstance({
      environment: 'production',
      persistence: 'localStorage'
    });
  }

  // Utility methods
  reset(): void {
    RepositoryFactory.clearAllRepositories();
    AppBootstrap.instance = null;
  }

  getConfig(): AppConfig {
    return this.config;
  }
}