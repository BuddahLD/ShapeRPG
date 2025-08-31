/**
 * Infrastructure: Local Storage Adapter
 * Handles persistence to browser local storage
 */

import { Player } from '../../domain/entities/Player';
import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';

export interface StorageConfig {
  readonly keyPrefix: string;
  readonly version: string;
}

export class LocalStorageAdapter implements IPlayerRepository {
  private readonly config: StorageConfig;

  constructor(config: StorageConfig = { keyPrefix: 'figureium_', version: '1.0' }) {
    this.config = config;
  }

  async save(player: Player): Promise<void> {
    try {
      const key = this.getPlayerKey(player.id);
      const playerData = this.serializePlayer(player);
      localStorage.setItem(key, JSON.stringify(playerData));
    } catch (error) {
      throw new Error(`Failed to save player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Player | null> {
    try {
      const key = this.getPlayerKey(id);
      const data = localStorage.getItem(key);
      
      if (!data) return null;
      
      const playerData = JSON.parse(data);
      return this.deserializePlayer(playerData);
    } catch (error) {
      console.warn(`Failed to load player ${id}:`, error);
      return null;
    }
  }

  async findAll(): Promise<Player[]> {
    const players: Player[] = [];
    const playerKeys = this.getAllPlayerKeys();
    
    for (const key of playerKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const playerData = JSON.parse(data);
          const player = this.deserializePlayer(playerData);
          if (player) players.push(player);
        }
      } catch (error) {
        console.warn(`Failed to load player from key ${key}:`, error);
      }
    }
    
    return players;
  }

  async exists(id: string): Promise<boolean> {
    const key = this.getPlayerKey(id);
    return localStorage.getItem(key) !== null;
  }

  async delete(id: string): Promise<void> {
    const key = this.getPlayerKey(id);
    localStorage.removeItem(key);
  }

  // Utility methods
  clear(): void {
    const playerKeys = this.getAllPlayerKeys();
    playerKeys.forEach(key => localStorage.removeItem(key));
  }

  getStorageUsage(): { used: number; total: number; percentage: number } {
    let total = 0;
    let used = 0;

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || '';
        const size = (key.length + value.length) * 2; // 2 bytes per character
        total += size;
        
        if (key.startsWith(this.config.keyPrefix)) {
          used += size;
        }
      }
    }

    return {
      used,
      total,
      percentage: total > 0 ? (used / total) * 100 : 0
    };
  }

  private getPlayerKey(playerId: string): string {
    return `${this.config.keyPrefix}player_${playerId}`;
  }

  private getAllPlayerKeys(): string[] {
    const keys: string[] = [];
    const playerPrefix = `${this.config.keyPrefix}player_`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(playerPrefix)) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  private serializePlayer(player: Player) {
    return {
      id: player.id,
      position: player.position,
      stats: player.stats,
      level: player.level,
      experience: player.experience,
      gold: player.gold,
      knownSpells: Array.from(player.knownSpells),
      version: this.config.version,
      timestamp: Date.now()
    };
  }

  private deserializePlayer(data: any): Player | null {
    try {
      // Version compatibility check
      if (data.version !== this.config.version) {
        console.warn(`Player data version mismatch: ${data.version} vs ${this.config.version}`);
        // Could implement migration logic here
      }

      return new Player(
        data.id,
        data.position,
        data.stats,
        data.level,
        data.experience,
        data.gold,
        data.knownSpells || []
      );
    } catch (error) {
      console.error('Failed to deserialize player:', error);
      return null;
    }
  }
}