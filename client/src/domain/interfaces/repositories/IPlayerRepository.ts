/**
 * Domain Interface: Player Repository
 * Defines the contract for player data persistence
 */

import { Player } from '../../entities/Player';

export interface IPlayerRepository {
  save(player: Player): Promise<void>;
  findById(id: string): Promise<Player | null>;
  findAll(): Promise<Player[]>;
  exists(id: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}