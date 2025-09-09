/**
 * Unit Tests: DummyMovementUseCase
 * Tests the application use case for dummy movement
 */

import { DummyMovementUseCase } from '../DummyMovementUseCase';
import { Mob } from '../../../domain/entities/Mob';
import { MobFactory } from '../../../domain/factories/MobFactory';

describe('DummyMovementUseCase', () => {
  let useCase: DummyMovementUseCase;

  beforeEach(() => {
    useCase = new DummyMovementUseCase();
  });

  describe('execute', () => {
    it('should update dummy movement successfully', () => {
      const dummyMob = MobFactory.createDummyWithMovement(
        'test_dummy',
        { x: 0, y: 100 },
        1,
        0.5,
        30
      );
      const deltaTime = 16; // 60fps frame time

      const result = useCase.execute({
        mob: dummyMob,
        deltaTime
      });

      expect(result.success).toBe(true);
      expect(result.updatedMob).toBeDefined();
      expect(result.updatedMob.id).toBe('test_dummy');
      expect(result.updatedMob.isDummy()).toBe(true);
      expect(result.hasChangedDirection).toBe(false);
      expect(result.movementProgress).toBeGreaterThanOrEqual(0);
      expect(result.movementProgress).toBeLessThanOrEqual(1);
      expect(result.cyclePhase).toBeGreaterThanOrEqual(0);
      expect(result.cyclePhase).toBeLessThanOrEqual(1);
      expect(result.cycleDirection).toBe(1); // Should start moving up
    });

    it('should return failure for non-dummy mob', () => {
      const regularMob = MobFactory.createMob(
        'test_hex',
        'HEX_PEACEFUL',
        { x: 0, y: 100 }
      );
      const deltaTime = 16;

      const result = useCase.execute({
        mob: regularMob,
        deltaTime
      });

      expect(result.success).toBe(false);
      expect(result.updatedMob).toBe(regularMob);
      expect(result.hasChangedDirection).toBe(false);
      expect(result.movementProgress).toBe(0);
      expect(result.cyclePhase).toBe(0);
      expect(result.cycleDirection).toBe(0);
    });

    it('should return failure for dummy without movement state', () => {
      const dummyMob = MobFactory.createMob(
        'test_dummy',
        'DUMMY',
        { x: 0, y: 100 }
      );
      const deltaTime = 16;

      const result = useCase.execute({
        mob: dummyMob,
        deltaTime
      });

      expect(result.success).toBe(false);
      expect(result.updatedMob).toBe(dummyMob);
    });
  });

  describe('initializeMovementState', () => {
    it('should initialize movement state for dummy mob', () => {
      const dummyMob = MobFactory.createMob(
        'test_dummy',
        'DUMMY',
        { x: 0, y: 100 }
      );
      const centerY = 100;
      const movementSpeed = 1.0;
      const movementRange = 40;

      const result = useCase.initializeMovementState(
        dummyMob,
        centerY,
        movementSpeed,
        movementRange
      );

      expect(result.hasMovementBehavior()).toBe(true);
      expect(result.movementState).toBeDefined();
      expect(result.movementState?.centerY).toBe(100);
      expect(result.movementState?.movementSpeed).toBe(1.0);
      expect(result.movementState?.movementRange).toBe(40);
    });

    it('should return original mob for non-dummy', () => {
      const regularMob = MobFactory.createMob(
        'test_hex',
        'HEX_PEACEFUL',
        { x: 0, y: 100 }
      );

      const result = useCase.initializeMovementState(regularMob, 100);

      expect(result).toBe(regularMob);
    });
  });

  describe('isAtCenter', () => {
    it('should return true when dummy is at center', () => {
      const dummyMob = MobFactory.createDummyWithMovement(
        'test_dummy',
        { x: 0, y: 100 },
        1,
        0.5,
        30
      );

      expect(useCase.isAtCenter(dummyMob)).toBe(true);
    });

    it('should return false for non-dummy mob', () => {
      const regularMob = MobFactory.createMob(
        'test_hex',
        'HEX_PEACEFUL',
        { x: 0, y: 100 }
      );

      expect(useCase.isAtCenter(regularMob)).toBe(false);
    });
  });

  describe('getMovementProgress', () => {
    it('should return progress for dummy with movement', () => {
      const dummyMob = MobFactory.createDummyWithMovement(
        'test_dummy',
        { x: 0, y: 100 },
        1,
        0.5,
        30
      );

      const progress = useCase.getMovementProgress(dummyMob);

      expect(progress).toBe(0.5); // At center
    });

    it('should return 0 for non-dummy mob', () => {
      const regularMob = MobFactory.createMob(
        'test_hex',
        'HEX_PEACEFUL',
        { x: 0, y: 100 }
      );

      expect(useCase.getMovementProgress(regularMob)).toBe(0);
    });
  });
});
