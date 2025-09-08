/**
 * Infrastructure: In-Memory World Repository Implementation
 * Concrete implementation of IWorldRepository using in-memory storage
 */

import { WorldArea, LocationId } from '../../domain/valueObjects/WorldArea';
import { Mob } from '../../domain/entities/Mob';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';

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
    // Hub Area
    const hubArea = new WorldArea(
      'LOC_HUB_FIGUREIUM' as LocationId,
      'Hub',
      { minX: -200, maxX: 200, minY: -150, maxY: 150 },
      'hub',
      {
        primary: '#a78bfa',
        secondary: '#c4b5fd', 
        accent: '#ddd6fe',
        background: '#faf5ff'
      },
      false, // No mob spawning
      '#8b5cf6'
    );

    // Peaceful Fields
    const fieldsArea = new WorldArea(
      'LOC_PEACEFUL_FIELDS' as LocationId,
      'Fields', 
      { minX: 200, maxX: 600, minY: -150, maxY: 150 },
      'exploration',
      {
        primary: '#34d399',
        secondary: '#6ee7b7',
        accent: '#a7f3d0',
        background: '#f0fdf4'
      },
      false, // No mob spawning in peaceful fields
      '#10b981'
    );

    // Shards Area  
    const shardsArea = new WorldArea(
      'LOC_SHARDS' as LocationId,
      'Shards',
      { minX: 600, maxX: 1100, minY: -450, maxY: 450 }, // width/4 (500), height*3 (900)
      'exploration',
      {
        primary: '#fb7185',
        secondary: '#fda4af',
        accent: '#fecdd3',
        background: '#fff1f2'
      },
      true, // Mob spawning allowed (neutral mobs)
      '#dc2626'
    );

    this.areas = [hubArea, fieldsArea, shardsArea];
  }
}