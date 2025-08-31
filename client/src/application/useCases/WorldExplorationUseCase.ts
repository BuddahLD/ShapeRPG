/**
 * Application Use Case: World Exploration
 * Orchestrates world exploration, area transitions, and chunk loading
 */

import { Player } from '../../domain/entities/Player';
import { WorldArea } from '../../domain/valueObjects/WorldArea';
import { WorldDomainService } from '../../domain/services/WorldDomainService';
import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';

export interface ChunkCoordinates {
  readonly x: number;
  readonly y: number;
}

export interface ExploreWorldRequest {
  readonly playerId: string;
  readonly playerPosition: { x: number; y: number };
  readonly loadRadius: number;
}

export interface ExploreWorldResponse {
  readonly success: boolean;
  readonly currentArea: WorldArea | null;
  readonly nearbyAreas: WorldArea[];
  readonly chunksToLoad: ChunkCoordinates[];
  readonly chunksToUnload: ChunkCoordinates[];
  readonly accessibleAreas: WorldArea[];
}

export interface GetAreaInfoRequest {
  readonly areaId: string;
}

export interface GetAreaInfoResponse {
  readonly success: boolean;
  readonly area: WorldArea | null;
  readonly adjacentAreas: WorldArea[];
  readonly isAccessible: boolean;
}

export class WorldExplorationUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly worldRepository: IWorldRepository
  ) {}

  async exploreWorld(request: ExploreWorldRequest): Promise<ExploreWorldResponse> {
    const { playerId, playerPosition, loadRadius } = request;

    // Get player
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }

    // Get all world areas
    const allAreas = await this.worldRepository.getAllAreas();

    // Determine current area
    const currentArea = WorldDomainService.findAreaForPosition(
      allAreas,
      playerPosition.x,
      playerPosition.y
    );

    // Find nearby areas (within exploration range)
    const nearbyAreas = this.findNearbyAreas(allAreas, playerPosition, loadRadius * 400); // Assuming chunk size of 400

    // Calculate chunks to load/unload
    const chunksToLoad = this.calculateChunksToLoad(playerPosition, loadRadius);
    const chunksToUnload = this.calculateChunksToUnload(
      player.position,
      playerPosition,
      loadRadius
    );

    // Get accessible areas from current position
    const accessibleAreas = currentArea 
      ? WorldDomainService.getAccessibleAreas(currentArea, allAreas)
      : [];

    return {
      success: true,
      currentArea,
      nearbyAreas,
      chunksToLoad,
      chunksToUnload,
      accessibleAreas
    };
  }

  async getAreaInfo(request: GetAreaInfoRequest): Promise<GetAreaInfoResponse> {
    const allAreas = await this.worldRepository.getAllAreas();
    const area = allAreas.find(a => a.id === request.areaId) || null;

    if (!area) {
      return {
        success: false,
        area: null,
        adjacentAreas: [],
        isAccessible: false
      };
    }

    const adjacentAreas = WorldDomainService.getAccessibleAreas(area, allAreas);

    return {
      success: true,
      area,
      adjacentAreas,
      isAccessible: true
    };
  }

  async getWorldBounds(): Promise<{ minX: number; maxX: number; minY: number; maxY: number }> {
    const allAreas = await this.worldRepository.getAllAreas();
    
    if (allAreas.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    return {
      minX: Math.min(...allAreas.map(a => a.bounds.minX)),
      maxX: Math.max(...allAreas.map(a => a.bounds.maxX)),
      minY: Math.min(...allAreas.map(a => a.bounds.minY)),
      maxY: Math.max(...allAreas.map(a => a.bounds.maxY))
    };
  }

  private findNearbyAreas(
    allAreas: WorldArea[], 
    position: { x: number; y: number }, 
    radius: number
  ): WorldArea[] {
    return allAreas.filter(area => {
      const distanceFromCenter = area.getDistanceFromCenter(position.x, position.y);
      return distanceFromCenter <= radius;
    });
  }

  private calculateChunksToLoad(
    position: { x: number; y: number }, 
    loadRadius: number
  ): ChunkCoordinates[] {
    const chunks: ChunkCoordinates[] = [];
    const chunkSize = 400;
    
    const centerChunkX = Math.floor(position.x / chunkSize);
    const centerChunkY = Math.floor(position.y / chunkSize);

    for (let x = centerChunkX - loadRadius; x <= centerChunkX + loadRadius; x++) {
      for (let y = centerChunkY - loadRadius; y <= centerChunkY + loadRadius; y++) {
        const distance = Math.max(Math.abs(x - centerChunkX), Math.abs(y - centerChunkY));
        if (distance <= loadRadius) {
          chunks.push({ x, y });
        }
      }
    }

    return chunks;
  }

  private calculateChunksToUnload(
    previousPosition: { x: number; y: number },
    currentPosition: { x: number; y: number },
    loadRadius: number
  ): ChunkCoordinates[] {
    const chunks: ChunkCoordinates[] = [];
    const chunkSize = 400;
    const unloadDistance = loadRadius + 1;
    
    const currentChunkX = Math.floor(currentPosition.x / chunkSize);
    const currentChunkY = Math.floor(currentPosition.y / chunkSize);
    
    const previousChunkX = Math.floor(previousPosition.x / chunkSize);
    const previousChunkY = Math.floor(previousPosition.y / chunkSize);

    // Find chunks that were loaded around previous position but are now too far
    for (let x = previousChunkX - loadRadius; x <= previousChunkX + loadRadius; x++) {
      for (let y = previousChunkY - loadRadius; y <= previousChunkY + loadRadius; y++) {
        const distanceFromCurrent = Math.max(
          Math.abs(x - currentChunkX), 
          Math.abs(y - currentChunkY)
        );
        
        if (distanceFromCurrent > unloadDistance) {
          chunks.push({ x, y });
        }
      }
    }

    return chunks;
  }
}