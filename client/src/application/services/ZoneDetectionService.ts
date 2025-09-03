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
      let currentArea = WorldDomainService.findAreaForPosition(
        allAreas,
        request.playerPosition.x,
        request.playerPosition.y
      );

      // If no area found, create a "Nowhere" area
      if (!currentArea) {
        currentArea = new WorldArea(
          'LOC_NOWHERE' as any,
          'Nowhere',
          { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity },
          'exploration',
          {
            primary: '#6b7280',
            secondary: '#9ca3af',
            accent: '#d1d5db',
            background: '#f9fafb'
          },
          false, // No enemy spawning in nowhere
          '#6b7280'
        );
      }

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
