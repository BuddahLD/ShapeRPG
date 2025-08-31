import { describe, it, expect } from 'vitest';
import { WorldAreaManager } from '../WorldAreaManager';
import { LocationId } from '../../types/gameTypes';

describe('WorldAreaManager', () => {
  describe('getAllAreas', () => {
    it('should return all defined areas', () => {
      const areas = WorldAreaManager.getAllAreas();
      expect(areas).toHaveLength(3);
      expect(areas.map(a => a.id)).toEqual([
        'LOC_HUB_FIGUREIUM',
        'LOC_PEACEFUL_FIELDS', 
        'LOC_ARENA_1'
      ]);
    });

    it('should return areas with proper structure', () => {
      const areas = WorldAreaManager.getAllAreas();
      areas.forEach(area => {
        expect(area).toHaveProperty('id');
        expect(area).toHaveProperty('name');
        expect(area).toHaveProperty('bounds');
        expect(area).toHaveProperty('backgroundGradient');
        expect(area).toHaveProperty('hasEnemies');
        expect(area).toHaveProperty('gamePhase');
        expect(area).toHaveProperty('visualTheme');
        
        // Check bounds structure
        expect(area.bounds).toHaveProperty('minX');
        expect(area.bounds).toHaveProperty('maxX');
        expect(area.bounds).toHaveProperty('minY');
        expect(area.bounds).toHaveProperty('maxY');
        
        // Check visual theme structure
        expect(area.visualTheme).toHaveProperty('primary');
        expect(area.visualTheme).toHaveProperty('secondary');
        expect(area.visualTheme).toHaveProperty('accent');
      });
    });
  });

  describe('getAreaById', () => {
    it('should return correct area for valid ID', () => {
      const hubArea = WorldAreaManager.getAreaById('LOC_HUB_FIGUREIUM');
      expect(hubArea?.id).toBe('LOC_HUB_FIGUREIUM');
      expect(hubArea?.name).toBe('Hub');
      expect(hubArea?.gamePhase).toBe('hub');
      expect(hubArea?.hasEnemies).toBe(false);
    });

    it('should return undefined for invalid ID', () => {
      const area = WorldAreaManager.getAreaById('INVALID_ID' as LocationId);
      expect(area).toBeUndefined();
    });

    it('should return correct properties for each area', () => {
      const hub = WorldAreaManager.getAreaById('LOC_HUB_FIGUREIUM');
      const fields = WorldAreaManager.getAreaById('LOC_PEACEFUL_FIELDS');
      const arena = WorldAreaManager.getAreaById('LOC_ARENA_1');

      expect(hub?.bounds).toEqual({ minX: -200, maxX: 200, minY: -150, maxY: 150 });
      expect(fields?.bounds).toEqual({ minX: 200, maxX: 600, minY: -150, maxY: 150 });
      expect(arena?.bounds).toEqual({ minX: 600, maxX: 2600, minY: -150, maxY: 150 });

      expect(hub?.hasEnemies).toBe(false);
      expect(fields?.hasEnemies).toBe(false);
      expect(arena?.hasEnemies).toBe(true);
    });
  });

  describe('getAreaForPosition', () => {
    describe('Hub area detection', () => {
      it('should detect hub for center position', () => {
        const area = WorldAreaManager.getAreaForPosition(0, 0);
        expect(area?.id).toBe('LOC_HUB_FIGUREIUM');
      });

      it('should detect hub for negative coordinates', () => {
        const area = WorldAreaManager.getAreaForPosition(-100, -50);
        expect(area?.id).toBe('LOC_HUB_FIGUREIUM');
      });

      it('should detect hub at boundaries', () => {
        const leftBoundary = WorldAreaManager.getAreaForPosition(-200, 0);
        const rightBoundary = WorldAreaManager.getAreaForPosition(200, 0);
        const topBoundary = WorldAreaManager.getAreaForPosition(0, 150);
        const bottomBoundary = WorldAreaManager.getAreaForPosition(0, -150);

        expect(leftBoundary?.id).toBe('LOC_HUB_FIGUREIUM');
        expect(rightBoundary?.id).toBe('LOC_HUB_FIGUREIUM');
        expect(topBoundary?.id).toBe('LOC_HUB_FIGUREIUM');
        expect(bottomBoundary?.id).toBe('LOC_HUB_FIGUREIUM');
      });
    });

    describe('Peaceful Fields area detection', () => {
      it('should detect fields for middle positions', () => {
        const area = WorldAreaManager.getAreaForPosition(400, 0);
        expect(area?.id).toBe('LOC_PEACEFUL_FIELDS');
      });

      it('should detect fields at boundaries', () => {
        const leftBoundary = WorldAreaManager.getAreaForPosition(200, 0);
        const rightBoundary = WorldAreaManager.getAreaForPosition(600, 0);

        expect(leftBoundary?.id).toBe('LOC_PEACEFUL_FIELDS');
        expect(rightBoundary?.id).toBe('LOC_PEACEFUL_FIELDS');
      });
    });

    describe('Arena area detection', () => {
      it('should detect arena for far positions', () => {
        const area = WorldAreaManager.getAreaForPosition(1000, 0);
        expect(area?.id).toBe('LOC_ARENA_1');
      });

      it('should detect arena at boundaries', () => {
        const leftBoundary = WorldAreaManager.getAreaForPosition(600, 0);
        const rightBoundary = WorldAreaManager.getAreaForPosition(2600, 0);

        expect(leftBoundary?.id).toBe('LOC_ARENA_1');
        expect(rightBoundary?.id).toBe('LOC_ARENA_1');
      });
    });

    describe('Outside areas', () => {
      it('should return undefined for positions outside all areas', () => {
        const farLeft = WorldAreaManager.getAreaForPosition(-300, 0);
        const farRight = WorldAreaManager.getAreaForPosition(3000, 0);
        const tooHigh = WorldAreaManager.getAreaForPosition(0, 200);
        const tooLow = WorldAreaManager.getAreaForPosition(0, -200);

        expect(farLeft).toBeUndefined();
        expect(farRight).toBeUndefined();
        expect(tooHigh).toBeUndefined();
        expect(tooLow).toBeUndefined();
      });
    });
  });

  describe('isPositionInArea', () => {
    it('should correctly identify positions within areas', () => {
      expect(WorldAreaManager.isPositionInArea(0, 0, 'LOC_HUB_FIGUREIUM')).toBe(true);
      expect(WorldAreaManager.isPositionInArea(-100, 50, 'LOC_HUB_FIGUREIUM')).toBe(true);
      expect(WorldAreaManager.isPositionInArea(400, 0, 'LOC_PEACEFUL_FIELDS')).toBe(true);
      expect(WorldAreaManager.isPositionInArea(1000, 0, 'LOC_ARENA_1')).toBe(true);
    });

    it('should correctly identify positions outside areas', () => {
      expect(WorldAreaManager.isPositionInArea(400, 0, 'LOC_HUB_FIGUREIUM')).toBe(false);
      expect(WorldAreaManager.isPositionInArea(0, 0, 'LOC_PEACEFUL_FIELDS')).toBe(false);
      expect(WorldAreaManager.isPositionInArea(400, 0, 'LOC_ARENA_1')).toBe(false);
    });

    it('should return false for invalid area ID', () => {
      expect(WorldAreaManager.isPositionInArea(0, 0, 'INVALID_ID' as LocationId)).toBe(false);
    });
  });

  describe('checkTransition', () => {
    it('should detect no transition when staying in same area', () => {
      const result = WorldAreaManager.checkTransition(0, 0, 'LOC_HUB_FIGUREIUM');
      expect(result.transitionDetected).toBe(false);
      expect(result.newLocation).toBe('LOC_HUB_FIGUREIUM');
      expect(result.area?.id).toBe('LOC_HUB_FIGUREIUM');
    });

    it('should detect transition from Hub to Fields', () => {
      const result = WorldAreaManager.checkTransition(300, 0, 'LOC_HUB_FIGUREIUM');
      expect(result.transitionDetected).toBe(true);
      expect(result.newLocation).toBe('LOC_PEACEFUL_FIELDS');
      expect(result.area?.id).toBe('LOC_PEACEFUL_FIELDS');
    });

    it('should detect transition from Fields to Arena', () => {
      const result = WorldAreaManager.checkTransition(800, 0, 'LOC_PEACEFUL_FIELDS');
      expect(result.transitionDetected).toBe(true);
      expect(result.newLocation).toBe('LOC_ARENA_1');
      expect(result.area?.id).toBe('LOC_ARENA_1');
    });

    it('should detect transition back to Hub', () => {
      const result = WorldAreaManager.checkTransition(100, 0, 'LOC_PEACEFUL_FIELDS');
      expect(result.transitionDetected).toBe(true);
      expect(result.newLocation).toBe('LOC_HUB_FIGUREIUM');
      expect(result.area?.id).toBe('LOC_HUB_FIGUREIUM');
    });

    it('should handle position outside all areas', () => {
      const result = WorldAreaManager.checkTransition(-300, 0, 'LOC_HUB_FIGUREIUM');
      expect(result.transitionDetected).toBe(false);
      expect(result.newLocation).toBeNull();
      expect(result.area).toBeUndefined();
    });
  });

  describe('getVisualBoundaries', () => {
    it('should return visual boundaries for all areas', () => {
      const boundaries = WorldAreaManager.getVisualBoundaries(0, 0, 400);
      expect(boundaries).toHaveLength(3);

      boundaries.forEach(boundary => {
        expect(boundary).toHaveProperty('areaId');
        expect(boundary).toHaveProperty('name');
        expect(boundary).toHaveProperty('gradient');
        expect(boundary).toHaveProperty('screenStartX');
        expect(boundary).toHaveProperty('screenEndX');
        expect(boundary).toHaveProperty('bounds');
      });
    });

    it('should calculate correct screen positions', () => {
      const playerX = 0;
      const screenCenterX = 400;
      const boundaries = WorldAreaManager.getVisualBoundaries(playerX, 0, screenCenterX);

      const hubBoundary = boundaries.find(b => b.areaId === 'LOC_HUB_FIGUREIUM');
      const fieldsBoundary = boundaries.find(b => b.areaId === 'LOC_PEACEFUL_FIELDS');
      const arenaBoundary = boundaries.find(b => b.areaId === 'LOC_ARENA_1');

      // Hub: minX=-200, maxX=200, player at 0, center at 400
      expect(hubBoundary?.screenStartX).toBe(200); // 400 + (-200 - 0)
      expect(hubBoundary?.screenEndX).toBe(600);   // 400 + (200 - 0)

      // Fields: minX=200, maxX=600
      expect(fieldsBoundary?.screenStartX).toBe(600); // 400 + (200 - 0)
      expect(fieldsBoundary?.screenEndX).toBe(1000);  // 400 + (600 - 0)

      // Arena: minX=600, maxX=2600
      expect(arenaBoundary?.screenStartX).toBe(1000); // 400 + (600 - 0)
      expect(arenaBoundary?.screenEndX).toBe(3000);   // 400 + (2600 - 0)
    });
  });

  describe('getWorldBounds', () => {
    it('should return correct world boundaries', () => {
      const bounds = WorldAreaManager.getWorldBounds();
      expect(bounds).toEqual({
        minX: -200,  // Hub leftmost
        maxX: 2600,  // Arena rightmost
        minY: -150,  // All areas bottom
        maxY: 150    // All areas top
      });
    });
  });

  describe('Boundary consistency', () => {
    it('should have no gaps between adjacent areas', () => {
      const areas = WorldAreaManager.getAllAreas();
      
      // Hub ends at 200, Fields starts at 200 - no gap
      const hub = areas.find(a => a.id === 'LOC_HUB_FIGUREIUM');
      const fields = areas.find(a => a.id === 'LOC_PEACEFUL_FIELDS');
      expect(hub?.bounds.maxX).toBe(fields?.bounds.minX);

      // Fields ends at 600, Arena starts at 600 - no gap
      const arena = areas.find(a => a.id === 'LOC_ARENA_1');
      expect(fields?.bounds.maxX).toBe(arena?.bounds.minX);
    });

    it('should have consistent Y boundaries across all areas', () => {
      const areas = WorldAreaManager.getAllAreas();
      areas.forEach(area => {
        expect(area.bounds.minY).toBe(-150);
        expect(area.bounds.maxY).toBe(150);
      });
    });
  });
});