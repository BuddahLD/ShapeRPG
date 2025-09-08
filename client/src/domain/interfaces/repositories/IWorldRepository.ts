/**
 * Domain Interface: World Repository  
 * Defines the contract for world data persistence
 */

import { WorldArea } from '../../valueObjects/WorldArea';
import { Mob } from '../../entities/Mob';

export interface IWorldRepository {
  getAllAreas(): Promise<WorldArea[]>;
  getAreaById(id: string): Promise<WorldArea | null>;
  saveMobs(mobs: Mob[]): Promise<void>;
  getMobsInArea(areaId: string): Promise<Mob[]>;
  clearMobsInArea(areaId: string): Promise<void>;
}