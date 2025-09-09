/**
 * Application Use Case: Dummy Movement
 * Orchestrates dummy character movement updates
 * Follows clean architecture - application layer coordinates domain services
 */

import { Mob } from '../../domain/entities/Mob';
import { DummyMovementService, MovementState } from '../../domain/services/DummyMovementService';

export interface UpdateDummyMovementRequest {
  readonly mob: Mob;
  readonly deltaTime: number;
}

export interface UpdateDummyMovementResponse {
  readonly success: boolean;
  readonly updatedMob: Mob;
  readonly hasChangedDirection: boolean;
  readonly movementProgress: number;
  readonly cyclePhase: number;
  readonly cycleDirection: number;
}

export class DummyMovementUseCase {
  /**
   * Updates dummy movement based on current state and time delta
   * Pure function - no side effects, returns new mob instance
   */
  execute(request: UpdateDummyMovementRequest): UpdateDummyMovementResponse {
    const { mob, deltaTime } = request;

    // Validate that this is a dummy mob
    if (!mob.isDummy()) {
      return {
        success: false,
        updatedMob: mob,
        hasChangedDirection: false,
        movementProgress: 0
      };
    }

    // Get current movement state
    const currentMovementState = mob.movementState;
    if (!currentMovementState) {
      // If no movement state, this is an error condition
      return {
        success: false,
        updatedMob: mob,
        hasChangedDirection: false,
        movementProgress: 0
      };
    }

    // Update movement using domain service
    const movementResult = DummyMovementService.updateMovement(
      mob.position,
      currentMovementState,
      deltaTime
    );

    // Create new mob with updated position and movement state
    const updatedMob = mob
      .moveTo(movementResult.newPosition)
      .updateMovementState(movementResult.newState);

    // Calculate movement progress and cycle information for animation/rendering purposes
    const movementProgress = DummyMovementService.getMovementProgress(
      movementResult.newPosition,
      movementResult.newState
    );
    const cyclePhase = DummyMovementService.getCyclePhase(
      movementResult.newPosition,
      movementResult.newState
    );
    const cycleDirection = DummyMovementService.getCycleDirection(movementResult.newState);

    return {
      success: true,
      updatedMob,
      hasChangedDirection: movementResult.hasChangedDirection,
      movementProgress,
      cyclePhase,
      cycleDirection
    };
  }

  /**
   * Initializes movement state for a dummy mob
   * Should be called when creating a new dummy mob
   */
  initializeMovementState(
    mob: Mob,
    centerY: number,
    movementSpeed?: number,
    movementRange?: number
  ): Mob {
    if (!mob.isDummy()) {
      return mob;
    }

    const movementState = DummyMovementService.createInitialState(
      centerY,
      movementSpeed,
      movementRange
    );

    return mob.updateMovementState(movementState);
  }

  /**
   * Checks if a dummy mob is at the center of its movement range
   */
  isAtCenter(mob: Mob): boolean {
    if (!mob.isDummy() || !mob.movementState) {
      return false;
    }

    return DummyMovementService.isAtCenter(mob.position, mob.movementState);
  }

  /**
   * Gets the movement progress for a dummy mob (0-1)
   */
  getMovementProgress(mob: Mob): number {
    if (!mob.isDummy() || !mob.movementState) {
      return 0;
    }

    return DummyMovementService.getMovementProgress(mob.position, mob.movementState);
  }
}
