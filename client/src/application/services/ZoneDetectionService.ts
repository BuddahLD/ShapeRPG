/**
 * Application Service: Zone Detection
 * Handles zone detection and area transitions for the game
 */

import { WorldArea } from '../../domain/valueObjects/WorldArea';
import { WorldDomainService } from '../../domain/services/WorldDomainService';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';

export interface ZoneDetectionRequest {
  readonly playerPosition: { x: number; y: number };
}

export interface ZoneDetectionResponse {
  readonly success: boolean;
  readonly currentArea: WorldArea | null;
  readonly areaChanged: boolean;
  readonly previousArea: WorldArea | null;
}

export class ZoneDetectionService {
  private lastDetectedArea: WorldArea | null = null;

  constructor(
    private readonly worldRepository: IWorldRepository
  ) {}

  async detectZone(request: ZoneDetectionRequest): Promise<ZoneDetectionResponse> {
    try {
      // Get all world areas
      const allAreas = await this.worldRepository.getAllAreas();
      
      // Determine current area based on position
      const currentArea = WorldDomainService.findAreaForPosition(
        allAreas,
        request.playerPosition.x,
        request.playerPosition.y
      );

      // Check if area has changed
      const areaChanged = this.lastDetectedArea?.id !== currentArea?.id;
      const previousArea = this.lastDetectedArea;

      // Update last detected area
      this.lastDetectedArea = currentArea;

      return {
        success: true,
        currentArea,
        areaChanged,
        previousArea
      };
    } catch (error) {
      return {
        success: false,
        currentArea: null,
        areaChanged: false,
        previousArea: this.lastDetectedArea
      };
    }
  }

  getLastDetectedArea(): WorldArea | null {
    return this.lastDetectedArea;
  }
}
