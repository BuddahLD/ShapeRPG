// Modern service abstraction for world management
// Following KISS principles - simple, focused, testable

import { ChunkCoordinates, Enemy, NPC, WorldZone, LocationId } from '../types/gameTypes';

export class WorldService {
  private static readonly CHUNK_SIZE = 400;
  private static readonly HUB_BOUNDS = { minX: -200, maxX: 200 };
  private static readonly FIELDS_BOUNDS = { minX: 200, maxX: 600 };
  private static readonly ARENA_BOUNDS = { minX: 600, maxX: 1000 };

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

  // Determine which zone a position belongs to
  static getZoneForPosition(x: number): LocationId {
    if (x >= WorldService.HUB_BOUNDS.minX && x <= WorldService.HUB_BOUNDS.maxX) {
      return 'LOC_HUB_FIGUREIUM';
    } else if (x >= WorldService.FIELDS_BOUNDS.minX && x <= WorldService.FIELDS_BOUNDS.maxX) {
      return 'LOC_PEACEFUL_FIELDS';
    } else if (x >= WorldService.ARENA_BOUNDS.minX && x <= WorldService.ARENA_BOUNDS.maxX) {
      return 'LOC_ARENA_1';
    }
    return 'LOC_HUB_FIGUREIUM'; // Default fallback
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