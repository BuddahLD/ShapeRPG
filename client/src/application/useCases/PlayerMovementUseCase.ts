/**
 * Application Use Case: Player Movement
 * Orchestrates player movement and world interactions
 */

import { Player, PlayerPosition } from '../../domain/entities/Player';
import { WorldArea } from '../../domain/valueObjects/WorldArea';
import { WorldDomainService } from '../../domain/services/WorldDomainService';
import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';
import { IWorldRepository } from '../../domain/interfaces/repositories/IWorldRepository';

export interface MovePlayerRequest {
  readonly playerId: string;
  readonly newPosition: PlayerPosition;
}

export interface MovePlayerResponse {
  readonly success: boolean;
  readonly player: Player;
  readonly currentArea: WorldArea | null;
  readonly areaChanged: boolean;
  readonly previousArea: WorldArea | null;
}

export class PlayerMovementUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly worldRepository: IWorldRepository
  ) {}

  async execute(request: MovePlayerRequest): Promise<MovePlayerResponse> {
    // Get current player state
    const currentPlayer = await this.playerRepository.findById(request.playerId);
    if (!currentPlayer) {
      throw new Error(`Player not found: ${request.playerId}`);
    }

    // Get all world areas
    const allAreas = await this.worldRepository.getAllAreas();
    
    // Determine current and new areas
    const previousArea = WorldDomainService.findAreaForPosition(
      allAreas, 
      currentPlayer.position.x, 
      currentPlayer.position.y
    );
    
    const newArea = WorldDomainService.findAreaForPosition(
      allAreas,
      request.newPosition.x,
      request.newPosition.y
    );

    // Validate movement (basic bounds checking)
    if (!newArea) {
      return {
        success: false,
        player: currentPlayer,
        currentArea: previousArea,
        areaChanged: false,
        previousArea: null
      };
    }

    // Validate area transition if changing areas
    if (previousArea && newArea && previousArea.id !== newArea.id) {
      const accessibleAreas = WorldDomainService.getAccessibleAreas(previousArea, allAreas);
      const canTransition = accessibleAreas.some(area => area.id === newArea.id);
      
      if (!canTransition) {
        return {
          success: false,
          player: currentPlayer,
          currentArea: previousArea,
          areaChanged: false,
          previousArea: null
        };
      }
    }

    // Move player
    const updatedPlayer = currentPlayer.moveTo(request.newPosition);

    // Save updated player state
    await this.playerRepository.save(updatedPlayer);

    return {
      success: true,
      player: updatedPlayer,
      currentArea: newArea,
      areaChanged: previousArea?.id !== newArea?.id,
      previousArea: previousArea
    };
  }
}