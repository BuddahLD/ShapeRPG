// Modern service abstraction for world management
// Following KISS principles - simple, focused, testable

import { ChunkCoordinates, Enemy, NPC, WorldZone, LocationId, EnemyType } from '../types/gameTypes';

// Zone configuration for enemy spawning and properties
export interface ZoneConfig {
  id: LocationId;
  bounds: { minX: number; maxX: number };
  allowsEnemySpawning: boolean;
  enemyTypes?: {
    type: EnemyType;
    spawnRate: number;
    count: number;
    stats: {
      hp: number;
      maxHp: number;
      atk: number;
      def: number;
      size: number;
    };
  }[];
}

const ZONE_CONFIGS: ZoneConfig[] = [
  {
    id: 'LOC_HUB_FIGUREIUM',
    bounds: { minX: -200, maxX: 200 },
    allowsEnemySpawning: false
  },
  {
    id: 'LOC_PEACEFUL_FIELDS',
    bounds: { minX: 200, maxX: 600 },
    allowsEnemySpawning: true,
    enemyTypes: [{
      type: 'HEX_PEACEFUL' as EnemyType,
      spawnRate: 0.7,
      count: 2,
      stats: { hp: 20, maxHp: 20, atk: 2, def: 1, size: 15 }
    }]
  },
  {
    id: 'LOC_ARENA_1',
    bounds: { minX: 600, maxX: 2600 },
    allowsEnemySpawning: true,
    enemyTypes: [{
      type: 'TRI_ARENA' as EnemyType,
      spawnRate: 0.8,
      count: 3,
      stats: { hp: 60, maxHp: 60, atk: 12, def: 5, size: 20 }
    }]
  }
];

export class WorldService {
  private static readonly CHUNK_SIZE = 400;
  private static readonly HUB_BOUNDS = { minX: -200, maxX: 200 };
  private static readonly FIELDS_BOUNDS = { minX: 200, maxX: 600 };
  private static readonly ARENA_BOUNDS = { minX: 600, maxX: 2600 };

  // Pure function for chunk coordinate calculation
  static getChunkCoordinates(worldX: number, worldY: number): ChunkCoordinates {
    return {
      x: Math.floor(worldX / WorldService.CHUNK_SIZE),
      y: Math.floor(worldY / WorldService.CHUNK_SIZE)
    };
  }

  // Pure function for chunk key generation
  static getChunkKey(coordinates: ChunkCoordinates): string {
    return `${coordinates.x},${coordinates.y}`;
  }

  // Get zone configuration by ID
  static getZoneConfig(zoneId: LocationId): ZoneConfig | undefined {
    return ZONE_CONFIGS.find(config => config.id === zoneId);
  }

  // Get zone configuration for a position
  static getZoneConfigForPosition(x: number): ZoneConfig | undefined {
    return ZONE_CONFIGS.find(config => 
      x >= config.bounds.minX && x <= config.bounds.maxX
    );
  }

  // Determine which zone a position belongs to
  static getZoneForPosition(x: number): LocationId {
    const config = WorldService.getZoneConfigForPosition(x);
    return config?.id || 'LOC_HUB_FIGUREIUM'; // Default fallback
  }

  // Calculate chunks that should be loaded around a position
  static getNearbyChunkCoordinates(
    playerX: number, 
    playerY: number, 
    loadDistance: number = 2
  ): ChunkCoordinates[] {
    const playerChunk = WorldService.getChunkCoordinates(playerX, playerY);
    const chunks: ChunkCoordinates[] = [];

    for (let dx = -loadDistance; dx <= loadDistance; dx++) {
      for (let dy = -loadDistance; dy <= loadDistance; dy++) {
        chunks.push({
          x: playerChunk.x + dx,
          y: playerChunk.y + dy
        });
      }
    }

    return chunks;
  }

  // Calculate which chunks should be unloaded
  static getChunksToUnload(
    loadedChunks: Map<string, any>,
    playerX: number,
    playerY: number,
    loadDistance: number = 2
  ): ChunkCoordinates[] {
    const playerChunk = WorldService.getChunkCoordinates(playerX, playerY);
    const chunksToUnload: ChunkCoordinates[] = [];

    loadedChunks.forEach((chunk) => {
      const distance = Math.max(
        Math.abs(chunk.x - playerChunk.x),
        Math.abs(chunk.y - playerChunk.y)
      );

      if (distance > loadDistance + 1) {
        chunksToUnload.push({ x: chunk.x, y: chunk.y });
      }
    });

    return chunksToUnload;
  }
}