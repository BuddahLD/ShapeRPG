/**
 * Domain Service: Dummy Movement
 * Handles up-down movement behavior for dummy characters
 * Follows clean architecture principles - pure domain logic
 */

export interface MovementState {
  readonly isMovingUp: boolean;
  readonly isMovingDown: boolean;
  readonly currentDirection: 'up' | 'down';
  readonly lastDirectionChange: number;
  readonly movementSpeed: number;
  readonly movementRange: number;
  readonly centerY: number;
}

export interface MovementResult {
  readonly newPosition: { x: number; y: number };
  readonly newState: MovementState;
  readonly hasChangedDirection: boolean;
}

export class DummyMovementService {
  private static readonly DEFAULT_MOVEMENT_SPEED = 0.5; // units per frame
  private static readonly DEFAULT_MOVEMENT_RANGE = 50; // units up and down from center
  private static readonly DIRECTION_CHANGE_INTERVAL = 3000; // milliseconds

  /**
   * Creates initial movement state for a dummy character
   */
  static createInitialState(
    centerY: number,
    movementSpeed: number = DummyMovementService.DEFAULT_MOVEMENT_SPEED,
    movementRange: number = DummyMovementService.DEFAULT_MOVEMENT_RANGE
  ): MovementState {
    const currentTime = Date.now();
    return {
      isMovingUp: true,
      isMovingDown: false,
      currentDirection: 'up',
      lastDirectionChange: currentTime,
      movementSpeed,
      movementRange,
      centerY
    };
  }

  /**
   * Updates movement state and calculates new position
   * Pure function - no side effects
   * Implements continuous up-down cycling behavior
   */
  static updateMovement(
    currentPosition: { x: number; y: number },
    currentState: MovementState,
    deltaTime: number
  ): MovementResult {
    const currentTime = Date.now();
    const timeSinceLastChange = currentTime - currentState.lastDirectionChange;
    
    // Check if it's time to change direction (time-based cycling)
    const shouldChangeDirection = timeSinceLastChange >= DummyMovementService.DIRECTION_CHANGE_INTERVAL;
    
    let newState = currentState;
    let hasChangedDirection = false;

    // Calculate movement based on current direction
    const movementDelta = newState.movementSpeed * deltaTime;
    let newY = currentPosition.y;

    if (newState.currentDirection === 'up') {
      newY = currentPosition.y - movementDelta;
      // Check if we've reached the top of the range
      if (newY <= newState.centerY - newState.movementRange) {
        newY = newState.centerY - newState.movementRange;
        // Change direction to down (range-based cycling)
        newState = DummyMovementService.changeDirection(newState, currentTime);
        hasChangedDirection = true;
      }
    } else {
      newY = currentPosition.y + movementDelta;
      // Check if we've reached the bottom of the range
      if (newY >= newState.centerY + newState.movementRange) {
        newY = newState.centerY + newState.movementRange;
        // Change direction to up (range-based cycling)
        newState = DummyMovementService.changeDirection(newState, currentTime);
        hasChangedDirection = true;
      }
    }

    // Time-based direction change (backup cycling mechanism)
    if (shouldChangeDirection && !hasChangedDirection) {
      newState = DummyMovementService.changeDirection(newState, currentTime);
      hasChangedDirection = true;
    }

    return {
      newPosition: {
        x: currentPosition.x, // Dummy only moves vertically
        y: newY
      },
      newState,
      hasChangedDirection
    };
  }

  /**
   * Changes movement direction
   * Pure function - no side effects
   */
  private static changeDirection(
    currentState: MovementState,
    currentTime: number
  ): MovementState {
    const newDirection = currentState.currentDirection === 'up' ? 'down' : 'up';
    
    return {
      ...currentState,
      isMovingUp: newDirection === 'up',
      isMovingDown: newDirection === 'down',
      currentDirection: newDirection,
      lastDirectionChange: currentTime
    };
  }

  /**
   * Checks if dummy is at the center of its movement range
   */
  static isAtCenter(position: { x: number; y: number }, state: MovementState): boolean {
    const tolerance = 5; // Allow small tolerance for floating point precision
    return Math.abs(position.y - state.centerY) <= tolerance;
  }

  /**
   * Gets the movement progress as a percentage (0-1)
   * 0 = at bottom, 0.5 = at center, 1 = at top
   */
  static getMovementProgress(position: { x: number; y: number }, state: MovementState): number {
    const totalRange = state.movementRange * 2;
    const distanceFromBottom = position.y - (state.centerY - state.movementRange);
    return Math.max(0, Math.min(1, distanceFromBottom / totalRange));
  }

  /**
   * Gets the current cycle phase (0-1) for smooth animation
   * 0 = starting to move up, 0.5 = at top, 1 = starting to move down
   * This provides a continuous cycle value for animation purposes
   */
  static getCyclePhase(position: { x: number; y: number }, state: MovementState): number {
    const progress = DummyMovementService.getMovementProgress(position, state);
    
    // Convert linear progress to cycle phase
    if (state.currentDirection === 'up') {
      // Moving up: 0 to 0.5 maps to 0 to 1
      return Math.min(1, progress * 2);
    } else {
      // Moving down: 0.5 to 1 maps to 1 to 0 (inverted)
      return Math.max(0, 2 - progress * 2);
    }
  }

  /**
   * Gets the cycle direction for animation purposes
   * Returns 1 for moving up, -1 for moving down
   */
  static getCycleDirection(state: MovementState): number {
    return state.currentDirection === 'up' ? 1 : -1;
  }
}
