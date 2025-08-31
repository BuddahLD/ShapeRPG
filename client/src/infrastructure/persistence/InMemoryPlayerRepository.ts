/**
 * Infrastructure: In-Memory Player Repository Implementation
 * Concrete implementation of IPlayerRepository using in-memory storage
 */

import { Player } from '../../domain/entities/Player';
import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';

export class InMemoryPlayerRepository implements IPlayerRepository {
  private players = new Map<string, Player>();

  async save(player: Player): Promise<void> {
    this.players.set(player.id, player);
  }

  async findById(id: string): Promise<Player | null> {
    return this.players.get(id) || null;
  }

  async findAll(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async exists(id: string): Promise<boolean> {
    return this.players.has(id);
  }

  async delete(id: string): Promise<void> {
    this.players.delete(id);
  }

  // Additional methods for testing/development
  clear(): void {
    this.players.clear();
  }

  getPlayerCount(): number {
    return this.players.size;
  }
}