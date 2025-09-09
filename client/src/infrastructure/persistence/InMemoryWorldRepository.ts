/**
 * Infrastructure: In-Memory World Repository Implementation
 * Concrete implementation of IWorldRepository using in-memory storage
 */

import { WorldArea, LocationId } from '../../domain/valueObjects/WorldArea';
import { Mob } from '../../domain/entities/Mob';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';
import { ZoneConfigurationService } from '../../domain/services/ZoneConfigurationService';

export class InMemoryWorldRepository implements IWorldRepository {
  private areas: WorldArea[] = [];
  private mobs = new Map<string, Mob[]>(); // areaId -> mobs

  constructor() {
    this.initializeDefaultAreas();
  }

  async getAllAreas(): Promise<WorldArea[]> {
    return [...this.areas];
  }

  async getAreaById(id: string): Promise<WorldArea | null> {
    return this.areas.find(area => area.id === id) || null;
  }

  async saveMobs(mobs: Mob[]): Promise<void> {
    // Group mobs by their current area
    const mobsByArea = new Map<string, Mob[]>();
    
    for (const mob of mobs) {
      const area = this.findAreaForPosition(mob.position.x, mob.position.y);
      if (area) {
        const areaMobs = mobsByArea.get(area.id) || [];
        areaMobs.push(mob);
        mobsByArea.set(area.id, areaMobs);
      }
    }

    // Update stored mobs
    mobsByArea.forEach((areaMobs, areaId) => {
      this.mobs.set(areaId, areaMobs);
    });
  }

  async getMobsInArea(areaId: string): Promise<Mob[]> {
    return this.mobs.get(areaId) || [];
  }

  async clearMobsInArea(areaId: string): Promise<void> {
    this.mobs.delete(areaId);
  }

  // Additional methods
  addArea(area: WorldArea): void {
    const existingIndex = this.areas.findIndex(a => a.id === area.id);
    if (existingIndex >= 0) {
      this.areas[existingIndex] = area;
    } else {
      this.areas.push(area);
    }
  }

  private findAreaForPosition(x: number, y: number): WorldArea | null {
    return this.areas.find(area => area.containsPosition(x, y)) || null;
  }

  private initializeDefaultAreas(): void {
    // Get zone configurations from single source of truth
    const zoneConfigs = ZoneConfigurationService.getAllZones();
    
    // Create WorldArea instances from configurations
    this.areas = zoneConfigs.map(config => new WorldArea(
      config.id,
      config.name,
      config.bounds,
      config.gamePhase,
      config.visualTheme,
      config.allowsMobSpawning,
      config.backgroundGradient
    ));
  }
}