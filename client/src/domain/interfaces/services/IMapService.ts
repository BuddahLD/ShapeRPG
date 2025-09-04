/**
 * Domain Interface: Map Service
 * Defines contract for map-related services (minimap, big map, etc.)
 */

import { WorldArea } from '../../valueObjects/WorldArea';
import { Enemy } from '../../entities/Enemy';

export interface MapConfig {
  readonly viewRadius: number;
  readonly mapSize: number;
  readonly zoomLevel: number;
}

export interface MapData {
  readonly playerPosition: { x: number; y: number };
  readonly viewBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  readonly visibleAreas: WorldArea[];
  readonly nearbyEnemies: Enemy[];
  readonly zoneColors: Map<string, string>;
}

export interface MapEntity {
  readonly id: string;
  readonly position: { x: number; y: number };
  readonly type: 'player' | 'enemy' | 'npc' | 'item' | 'waypoint';
  readonly color: string;
  readonly size: number;
  readonly label?: string;
}

export interface IMapService {
  /**
   * Get map data for current player position
   */
  getMapData(
    playerPosition: { x: number; y: number },
    config: Partial<MapConfig>,
    enemies?: Enemy[]
  ): Promise<MapData>;

  /**
   * Convert world coordinates to map coordinates
   */
  worldToMap(
    worldPos: { x: number; y: number },
    viewBounds: { minX: number; maxX: number; minY: number; maxY: number },
    mapSize: number
  ): { x: number; y: number };

  /**
   * Get entities to display on map
   */
  getMapEntities(
    mapData: MapData,
    enemies: Enemy[]
  ): MapEntity[];

  /**
   * Get zoom levels available for big map
   */
  getAvailableZoomLevels(): number[];

  /**
   * Calculate optimal view bounds for given zoom level
   */
  calculateViewBounds(
    playerPosition: { x: number; y: number },
    zoomLevel: number
  ): { minX: number; maxX: number; minY: number; maxY: number };
}

