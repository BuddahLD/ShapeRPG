/**
 * Unit Tests: DummyMovementService
 * Tests the domain service for dummy movement behavior
 */

import { DummyMovementService, MovementState } from '../DummyMovementService';

describe('DummyMovementService', () => {
  describe('createInitialState', () => {
    it('should create initial movement state with default values', () => {
      const centerY = 100;
      const state = DummyMovementService.createInitialState(centerY);

      expect(state.centerY).toBe(100);
      expect(state.isMovingUp).toBe(true);
      expect(state.isMovingDown).toBe(false);
      expect(state.currentDirection).toBe('up');
      expect(state.movementSpeed).toBe(0.5);
      expect(state.movementRange).toBe(50);
    });

    it('should create initial state with custom values', () => {
      const centerY = 200;
      const movementSpeed = 1.0;
      const movementRange = 30;
      
      const state = DummyMovementService.createInitialState(centerY, movementSpeed, movementRange);

      expect(state.centerY).toBe(200);
      expect(state.movementSpeed).toBe(1.0);
      expect(state.movementRange).toBe(30);
    });
  });

  describe('updateMovement', () => {
    let initialState: MovementState;

    beforeEach(() => {
      initialState = DummyMovementService.createInitialState(100, 0.5, 30);
    });

    it('should move up when direction is up', () => {
      const currentPosition = { x: 0, y: 100 };
      const deltaTime = 16; // 60fps frame time

      const result = DummyMovementService.updateMovement(currentPosition, initialState, deltaTime);

      expect(result.newPosition.x).toBe(0); // X should not change
      expect(result.newPosition.y).toBeLessThan(100); // Should move up
      expect(result.newState.currentDirection).toBe('up');
      expect(result.hasChangedDirection).toBe(false);
    });

    it('should move down when direction is down', () => {
      const downState = {
        ...initialState,
        currentDirection: 'down' as const,
        isMovingUp: false,
        isMovingDown: true
      };
      const currentPosition = { x: 0, y: 100 };
      const deltaTime = 16;

      const result = DummyMovementService.updateMovement(currentPosition, downState, deltaTime);

      expect(result.newPosition.x).toBe(0);
      expect(result.newPosition.y).toBeGreaterThan(100); // Should move down
      expect(result.newState.currentDirection).toBe('down');
    });

    it('should change direction when reaching top of range', () => {
      const currentPosition = { x: 0, y: 70 }; // Near top of range (100 - 30 = 70)
      const deltaTime = 100; // Large delta to ensure we hit the boundary

      const result = DummyMovementService.updateMovement(currentPosition, initialState, deltaTime);

      expect(result.newPosition.y).toBe(70); // Should be clamped to top
      expect(result.newState.currentDirection).toBe('down');
      expect(result.hasChangedDirection).toBe(true);
    });

    it('should change direction when reaching bottom of range', () => {
      const downState = {
        ...initialState,
        currentDirection: 'down' as const,
        isMovingUp: false,
        isMovingDown: true
      };
      const currentPosition = { x: 0, y: 130 }; // Near bottom of range (100 + 30 = 130)
      const deltaTime = 100;

      const result = DummyMovementService.updateMovement(currentPosition, downState, deltaTime);

      expect(result.newPosition.y).toBe(130); // Should be clamped to bottom
      expect(result.newState.currentDirection).toBe('up');
      expect(result.hasChangedDirection).toBe(true);
    });

    it('should change direction after time interval', () => {
      const oldState = {
        ...initialState,
        lastDirectionChange: Date.now() - 4000 // 4 seconds ago
      };
      const currentPosition = { x: 0, y: 100 };
      const deltaTime = 16;

      const result = DummyMovementService.updateMovement(currentPosition, oldState, deltaTime);

      expect(result.hasChangedDirection).toBe(true);
      expect(result.newState.currentDirection).toBe('down');
    });
  });

  describe('isAtCenter', () => {
    it('should return true when at center', () => {
      const state = DummyMovementService.createInitialState(100);
      const position = { x: 0, y: 100 };

      expect(DummyMovementService.isAtCenter(position, state)).toBe(true);
    });

    it('should return true when within tolerance', () => {
      const state = DummyMovementService.createInitialState(100);
      const position = { x: 0, y: 102 }; // Within 5 unit tolerance

      expect(DummyMovementService.isAtCenter(position, state)).toBe(true);
    });

    it('should return false when far from center', () => {
      const state = DummyMovementService.createInitialState(100);
      const position = { x: 0, y: 120 }; // Far from center

      expect(DummyMovementService.isAtCenter(position, state)).toBe(false);
    });
  });

  describe('getMovementProgress', () => {
    it('should return 0.5 when at center', () => {
      const state = DummyMovementService.createInitialState(0, 0.1, 115);
      const position = { x: 0, y: 0 }; // At center

      expect(DummyMovementService.getMovementProgress(position, state)).toBe(0.5);
    });

    it('should return 0 when at bottom', () => {
      const state = DummyMovementService.createInitialState(0, 0.1, 115);
      const position = { x: 0, y: -115 }; // At bottom (center - range)

      expect(DummyMovementService.getMovementProgress(position, state)).toBe(0);
    });

    it('should return 1 when at top', () => {
      const state = DummyMovementService.createInitialState(0, 0.1, 115);
      const position = { x: 0, y: 115 }; // At top (center + range)

      expect(DummyMovementService.getMovementProgress(position, state)).toBe(1);
    });
  });

  describe('getCyclePhase', () => {
    it('should return 0 when starting to move up from bottom', () => {
      const state = DummyMovementService.createInitialState(0, 0.1, 115);
      const position = { x: 0, y: -115 }; // At bottom, moving up

      expect(DummyMovementService.getCyclePhase(position, state)).toBe(0);
    });

    it('should return 1 when at top while moving up', () => {
      const state = DummyMovementService.createInitialState(0, 0.1, 115);
      const position = { x: 0, y: 115 }; // At top, moving up

      expect(DummyMovementService.getCyclePhase(position, state)).toBe(1);
    });

    it('should return 1 when starting to move down from top', () => {
      const downState = {
        ...DummyMovementService.createInitialState(0, 0.1, 115),
        currentDirection: 'down' as const,
        isMovingUp: false,
        isMovingDown: true
      };
      const position = { x: 0, y: 115 }; // At top, moving down

      expect(DummyMovementService.getCyclePhase(position, downState)).toBe(1);
    });

    it('should return 0 when at bottom while moving down', () => {
      const downState = {
        ...DummyMovementService.createInitialState(0, 0.1, 115),
        currentDirection: 'down' as const,
        isMovingUp: false,
        isMovingDown: true
      };
      const position = { x: 0, y: -115 }; // At bottom, moving down

      expect(DummyMovementService.getCyclePhase(position, downState)).toBe(0);
    });
  });

  describe('getCycleDirection', () => {
    it('should return 1 when moving up', () => {
      const state = DummyMovementService.createInitialState(0, 0.1, 115);

      expect(DummyMovementService.getCycleDirection(state)).toBe(1);
    });

    it('should return -1 when moving down', () => {
      const downState = {
        ...DummyMovementService.createInitialState(0, 0.1, 115),
        currentDirection: 'down' as const,
        isMovingUp: false,
        isMovingDown: true
      };

      expect(DummyMovementService.getCycleDirection(downState)).toBe(-1);
    });
  });

  describe('cycling behavior', () => {
    it('should complete a full up-down cycle', () => {
      const state = DummyMovementService.createInitialState(0, 0.1, 115); // Center at 0, range 115
      let currentPosition = { x: 0, y: 0 }; // Start at center
      let currentState = state;
      let directionChanges = 0;

      // Simulate multiple updates to test cycling
      for (let i = 0; i < 1000; i++) { // More iterations due to slower speed
        const result = DummyMovementService.updateMovement(currentPosition, currentState, 16);
        currentPosition = result.newPosition;
        currentState = result.newState;
        
        if (result.hasChangedDirection) {
          directionChanges++;
        }
      }

      // Should have changed direction at least once (up to down or down to up)
      expect(directionChanges).toBeGreaterThan(0);
      
      // Position should be within the movement range (center ± range)
      expect(currentPosition.y).toBeGreaterThanOrEqual(-115); // center - range
      expect(currentPosition.y).toBeLessThanOrEqual(115); // center + range
    });
  });
});
