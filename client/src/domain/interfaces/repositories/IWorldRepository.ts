/**
 * Domain Interface: World Repository  
 * Defines the contract for world data persistence
 */

import { WorldArea } from '../../valueObjects/WorldArea';
import { Enemy } from '../../entities/Enemy';

export interface IWorldRepository {
  getAllAreas(): Promise<WorldArea[]>;
  getAreaById(id: string): Promise<WorldArea | null>;
  saveEnemies(enemies: Enemy[]): Promise<void>;
  getEnemiesInArea(areaId: string): Promise<Enemy[]>;
  clearEnemiesInArea(areaId: string): Promise<void>;
}