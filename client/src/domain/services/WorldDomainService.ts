/**
 * Domain Service: World Logic
 * Pure business logic for world operations
 */

import { WorldArea, LocationId } from '../valueObjects/WorldArea';
import { Enemy, EnemyPosition } from '../entities/Enemy';

export class WorldDomainService {
  /**
   * Determine which area contains a given position
   */
  static findAreaForPosition(areas: WorldArea[], x: number, y: number): WorldArea | null {
    return areas.find(area => area.containsPosition(x, y)) || null;
  }

  /**
   * Calculate distance between two positions
   */
  static calculateDistance(pos1: EnemyPosition, pos2: EnemyPosition): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Determine if two areas are adjacent (share a border)
   */
  static areAreasAdjacent(area1: WorldArea, area2: WorldArea): boolean {
    const bounds1 = area1.bounds;
    const bounds2 = area2.bounds;

    // Check if they share a horizontal border
    const shareHorizontalBorder = 
      (bounds1.maxX === bounds2.minX || bounds1.minX === bounds2.maxX) &&
      !(bounds1.maxY < bounds2.minY || bounds1.minY > bounds2.maxY);

    // Check if they share a vertical border  
    const shareVerticalBorder = 
      (bounds1.maxY === bounds2.minY || bounds1.minY === bounds2.maxY) &&
      !(bounds1.maxX < bounds2.minX || bounds1.minX > bounds2.maxX);

    return shareHorizontalBorder || shareVerticalBorder;
  }

  /**
   * Calculate the optimal spawn position for an enemy in an area
   */
  static calculateEnemySpawnPosition(area: WorldArea, playerPosition: EnemyPosition): EnemyPosition {
    if (!area.allowsEnemySpawning) {
      throw new Error(`Cannot spawn enemies in safe zone: ${area.name}`);
    }

    const center = area.getCenter();
    const bounds = area.bounds;
    
    // Spawn away from player, but within area bounds
    const minDistance = 100; // Minimum distance from player
    const maxAttempts = 10;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const randomX = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const randomY = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
      
      const distanceFromPlayer = this.calculateDistance(
        { x: randomX, y: randomY },
        playerPosition
      );
      
      if (distanceFromPlayer >= minDistance) {
        return { x: randomX, y: randomY };
      }
    }
    
    // Fallback: spawn at area center
    return center;
  }

  /**
   * Check if a position is within a safe movement distance from area boundaries
   */
  static isPositionSafeInArea(area: WorldArea, position: EnemyPosition, safetyMargin: number = 10): boolean {
    const bounds = area.bounds;
    return position.x >= bounds.minX + safetyMargin &&
           position.x <= bounds.maxX - safetyMargin &&
           position.y >= bounds.minY + safetyMargin &&
           position.y <= bounds.maxY - safetyMargin;
  }

  /**
   * Get all areas that are accessible from a given area
   */
  static getAccessibleAreas(currentArea: WorldArea, allAreas: WorldArea[]): WorldArea[] {
    return allAreas.filter(area => 
      area !== currentArea && this.areAreasAdjacent(currentArea, area)
    );
  }

  /**
   * Calculate the transition point between two adjacent areas
   */
  static getAreaTransitionPoint(fromArea: WorldArea, toArea: WorldArea): EnemyPosition | null {
    if (!this.areAreasAdjacent(fromArea, toArea)) {
      return null;
    }

    const bounds1 = fromArea.bounds;
    const bounds2 = toArea.bounds;

    // Find the shared border
    if (bounds1.maxX === bounds2.minX) {
      // Right border of area1 touches left border of area2
      const y = (Math.max(bounds1.minY, bounds2.minY) + Math.min(bounds1.maxY, bounds2.maxY)) / 2;
      return { x: bounds1.maxX, y };
    }
    
    if (bounds1.minX === bounds2.maxX) {
      // Left border of area1 touches right border of area2
      const y = (Math.max(bounds1.minY, bounds2.minY) + Math.min(bounds1.maxY, bounds2.maxY)) / 2;
      return { x: bounds1.minX, y };
    }

    // Handle vertical transitions similarly...
    return fromArea.getCenter(); // Fallback
  }
}