/**
 * Infrastructure: Repository Factory
 * Creates repository instances based on configuration
 */

import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';
import { InMemoryPlayerRepository } from '../persistence/InMemoryPlayerRepository';
import { InMemoryWorldRepository } from '../persistence/InMemoryWorldRepository';
import { LocalStorageAdapter, StorageConfig } from '../adapters/LocalStorageAdapter';

export type RepositoryType = 'memory' | 'localStorage' | 'database';

export interface RepositoryConfig {
  readonly type: RepositoryType;
  readonly options?: Record<string, any>;
}

export class RepositoryFactory {
  private static playerRepositories = new Map<RepositoryType, IPlayerRepository>();
  private static worldRepositories = new Map<RepositoryType, IWorldRepository>();

  static createPlayerRepository(config: RepositoryConfig): IPlayerRepository {
    // Return singleton instance for the same type
    if (this.playerRepositories.has(config.type)) {
      return this.playerRepositories.get(config.type)!;
    }

    let repository: IPlayerRepository;

    switch (config.type) {
      case 'memory':
        repository = new InMemoryPlayerRepository();
        break;
        
      case 'localStorage':
        repository = new LocalStorageAdapter(config.options as StorageConfig | undefined);
        break;
        
      case 'database':
        // Would create a database repository implementation
        throw new Error('Database repository not implemented yet');
        
      default:
        throw new Error(`Unknown repository type: ${config.type}`);
    }

    this.playerRepositories.set(config.type, repository);
    return repository;
  }

  static createWorldRepository(config: RepositoryConfig): IWorldRepository {
    // Return singleton instance for the same type
    if (this.worldRepositories.has(config.type)) {
      return this.worldRepositories.get(config.type)!;
    }

    let repository: IWorldRepository;

    switch (config.type) {
      case 'memory':
        repository = new InMemoryWorldRepository();
        break;
        
      case 'localStorage':
        // Could create a localStorage world repository
        throw new Error('LocalStorage world repository not implemented yet');
        
      case 'database':
        // Would create a database repository implementation
        throw new Error('Database world repository not implemented yet');
        
      default:
        throw new Error(`Unknown repository type: ${config.type}`);
    }

    this.worldRepositories.set(config.type, repository);
    return repository;
  }

  // Factory methods for common configurations
  static createDevelopmentRepositories() {
    return {
      playerRepository: this.createPlayerRepository({ type: 'memory' }),
      worldRepository: this.createWorldRepository({ type: 'memory' })
    };
  }

  static createProductionRepositories() {
    return {
      playerRepository: this.createPlayerRepository({ 
        type: 'localStorage',
        options: { keyPrefix: 'figureium_prod_', version: '1.0' }
      }),
      worldRepository: this.createWorldRepository({ type: 'memory' })
    };
  }

  // Utility methods
  static clearAllRepositories(): void {
    this.playerRepositories.clear();
    this.worldRepositories.clear();
  }

  static getRegisteredRepositoryTypes(): {
    player: RepositoryType[];
    world: RepositoryType[];
  } {
    return {
      player: Array.from(this.playerRepositories.keys()),
      world: Array.from(this.worldRepositories.keys())
    };
  }
}