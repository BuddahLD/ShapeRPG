/**
 * Application Service: Minimap Management
 * Handles minimap data processing and local area calculations
 */

import { WorldArea } from '../../domain/valueObjects/WorldArea';
import { Enemy } from '../../domain/entities/Enemy';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';
import { IMapService, MapConfig, MapData, MapEntity } from '../../domain/interfaces/services/IMapService';

export class MinimapService implements IMapService {
  private readonly defaultConfig: MapConfig = {
    viewRadius: 200, // Show 200 units around player
    mapSize: 52,     // 52x52 pixel minimap
    zoomLevel: 1     // Base zoom level
  };

  private cachedAreas: WorldArea[] | null = null;

  constructor(
    private readonly worldRepository: IWorldRepository
  ) {}

  /**
   * Get map data for current player position
   */
  async getMapData(
    playerPosition: { x: number; y: number },
    config: Partial<MapConfig> = {}
  ): Promise<MapData> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Calculate view bounds around player
    const viewBounds = this.calculateViewBounds(playerPosition, finalConfig.zoomLevel);
    
    console.log('MinimapService: Player position:', playerPosition);
    console.log('MinimapService: View bounds:', viewBounds);
    
    // Get all world areas (cached for performance)
    if (!this.cachedAreas) {
      this.cachedAreas = await this.worldRepository.getAllAreas();
    }
    const allAreas = this.cachedAreas;
    
    // Find areas visible in current view
    const visibleAreas = this.getVisibleAreas(allAreas, viewBounds);
    
    console.log('MinimapService: Visible areas:', visibleAreas.map(a => a.id));
    
    // Get nearby enemies (placeholder for now)
    const nearbyEnemies: Enemy[] = [];
    
    // Create zone color map
    const zoneColors = this.createZoneColorMap(visibleAreas);
    
    return {
      playerPosition,
      viewBounds,
      visibleAreas,
      nearbyEnemies,
      zoneColors
    };
  }

  /**
   * Convert world coordinates to map coordinates
   */
  worldToMap(
    worldPos: { x: number; y: number },
    viewBounds: { minX: number; maxX: number; minY: number; maxY: number },
    mapSize: number
  ): { x: number; y: number } {
    const viewWidth = viewBounds.maxX - viewBounds.minX;
    const viewHeight = viewBounds.maxY - viewBounds.minY;
    
    return {
      x: ((worldPos.x - viewBounds.minX) / viewWidth) * mapSize,
      y: ((worldPos.y - viewBounds.minY) / viewHeight) * mapSize
    };
  }

  /**
   * Get entities to display on map
   */
  getMapEntities(
    mapData: MapData,
    enemies: Enemy[] = []
  ): MapEntity[] {
    const entities: MapEntity[] = [];
    
    // Add player
    entities.push({
      id: 'player',
      position: mapData.playerPosition,
      type: 'player',
      color: '#ffffff',
      size: 2
    });
    
    // Add nearby enemies
    enemies.forEach(enemy => {
      if (this.isPositionInBounds(enemy.position, mapData.viewBounds)) {
        entities.push({
          id: enemy.id,
          position: enemy.position,
          type: 'enemy',
          color: '#ef4444', // Red for enemies
          size: 1
        });
      }
    });
    
    return entities;
  }



  /**
   * Get areas visible in current view bounds
   */
  private getVisibleAreas(
    allAreas: WorldArea[],
    viewBounds: { minX: number; maxX: number; minY: number; maxY: number }
  ): WorldArea[] {
    return allAreas.filter(area => {
      // Check if area intersects with view bounds
      return !(
        area.bounds.maxX < viewBounds.minX ||
        area.bounds.minX > viewBounds.maxX ||
        area.bounds.maxY < viewBounds.minY ||
        area.bounds.minY > viewBounds.maxY
      );
    });
  }

  /**
   * Create color map for zones
   */
  private createZoneColorMap(areas: WorldArea[]): Map<string, string> {
    const colorMap = new Map<string, string>();
    
    areas.forEach(area => {
      switch (area.id) {
        case 'LOC_HUB_FIGUREIUM':
          colorMap.set(area.id, '#8b5cf6'); // Violet
          break;
        case 'LOC_PEACEFUL_FIELDS':
          colorMap.set(area.id, '#10b981'); // Green
          break;
        case 'LOC_SHARDS':
          colorMap.set(area.id, '#dc2626'); // Red
          break;
        case 'LOC_NOWHERE':
          colorMap.set(area.id, '#6b7280'); // Gray
          break;
        default:
          colorMap.set(area.id, '#6b7280'); // Default gray
      }
    });
    
    return colorMap;
  }

  /**
   * Get zoom levels available for big map
   */
  getAvailableZoomLevels(): number[] {
    return [0.5, 1, 2, 4, 8]; // Different zoom levels for big map
  }

  /**
   * Calculate optimal view bounds for given zoom level
   */
  calculateViewBounds(
    playerPosition: { x: number; y: number },
    zoomLevel: number
  ): { minX: number; maxX: number; minY: number; maxY: number } {
    // Base radius scales with zoom level
    const baseRadius = 200;
    const radius = baseRadius / zoomLevel;
    
    return {
      minX: playerPosition.x - radius,
      maxX: playerPosition.x + radius,
      minY: playerPosition.y - radius,
      maxY: playerPosition.y + radius
    };
  }

  /**
   * Check if position is within bounds
   */
  private isPositionInBounds(
    position: { x: number; y: number },
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
  ): boolean {
    return (
      position.x >= bounds.minX &&
      position.x <= bounds.maxX &&
      position.y >= bounds.minY &&
      position.y <= bounds.maxY
    );
  }
}
