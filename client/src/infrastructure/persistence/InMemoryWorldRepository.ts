/**
 * Infrastructure: In-Memory World Repository Implementation
 * Concrete implementation of IWorldRepository using in-memory storage
 */

import { WorldArea, LocationId } from '../../domain/valueObjects/WorldArea';
import { Enemy } from '../../domain/entities/Enemy';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';

export class InMemoryWorldRepository implements IWorldRepository {
  private areas: WorldArea[] = [];
  private enemies = new Map<string, Enemy[]>(); // areaId -> enemies

  constructor() {
    this.initializeDefaultAreas();
  }

  async getAllAreas(): Promise<WorldArea[]> {
    return [...this.areas];
  }

  async getAreaById(id: string): Promise<WorldArea | null> {
    return this.areas.find(area => area.id === id) || null;
  }

  async saveEnemies(enemies: Enemy[]): Promise<void> {
    // Group enemies by their current area
    const enemiesByArea = new Map<string, Enemy[]>();
    
    for (const enemy of enemies) {
      const area = this.findAreaForPosition(enemy.position.x, enemy.position.y);
      if (area) {
        const areaEnemies = enemiesByArea.get(area.id) || [];
        areaEnemies.push(enemy);
        enemiesByArea.set(area.id, areaEnemies);
      }
    }

    // Update stored enemies
    enemiesByArea.forEach((areaEnemies, areaId) => {
      this.enemies.set(areaId, areaEnemies);
    });
  }

  async getEnemiesInArea(areaId: string): Promise<Enemy[]> {
    return this.enemies.get(areaId) || [];
  }

  async clearEnemiesInArea(areaId: string): Promise<void> {
    this.enemies.delete(areaId);
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
      false, // No enemy spawning
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
      false, // No enemy spawning in peaceful fields
      '#10b981'
    );

    // Arena Area  
    const arenaArea = new WorldArea(
      'LOC_ARENA_1' as LocationId,
      'Arena',
      { minX: 600, maxX: 2600, minY: -150, maxY: 150 },
      'combat',
      {
        primary: '#fb7185',
        secondary: '#fda4af',
        accent: '#fecdd3',
        background: '#fff1f2'
      },
      true, // Enemy spawning allowed
      '#dc2626'
    );

    this.areas = [hubArea, fieldsArea, arenaArea];
  }
}