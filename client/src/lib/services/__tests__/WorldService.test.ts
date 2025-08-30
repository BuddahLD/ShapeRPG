import { describe, it, expect } from 'vitest';
import { WorldService } from '../WorldService';
import { ChunkCoordinates } from '../../types/gameTypes';

describe('WorldService', () => {
  describe('Chunk Coordinates', () => {
    it('should calculate chunk coordinates correctly', () => {
      expect(WorldService.getChunkCoordinates(0, 0)).toEqual({ x: 0, y: 0 });
      expect(WorldService.getChunkCoordinates(400, 0)).toEqual({ x: 1, y: 0 });
      expect(WorldService.getChunkCoordinates(-400, 0)).toEqual({ x: -1, y: 0 });
      expect(WorldService.getChunkCoordinates(200, 200)).toEqual({ x: 0, y: 0 });
      expect(WorldService.getChunkCoordinates(500, 500)).toEqual({ x: 1, y: 1 });
    });

    it('should generate consistent chunk keys', () => {
      const coords: ChunkCoordinates = { x: 1, y: 2 };
      expect(WorldService.getChunkKey(coords)).toBe('1,2');
      expect(WorldService.getChunkKey({ x: -1, y: -2 })).toBe('-1,-2');
    });
  });

  describe('Zone Detection', () => {
    it('should identify hub zone correctly', () => {
      expect(WorldService.getZoneForPosition(0)).toBe('LOC_HUB_FIGUREIUM');
      expect(WorldService.getZoneForPosition(-100)).toBe('LOC_HUB_FIGUREIUM');
      expect(WorldService.getZoneForPosition(100)).toBe('LOC_HUB_FIGUREIUM');
    });

    it('should identify fields zone correctly', () => {
      expect(WorldService.getZoneForPosition(300)).toBe('LOC_PEACEFUL_FIELDS');
      expect(WorldService.getZoneForPosition(400)).toBe('LOC_PEACEFUL_FIELDS');
    });

    it('should identify arena zone correctly', () => {
      expect(WorldService.getZoneForPosition(700)).toBe('LOC_ARENA_1');
      expect(WorldService.getZoneForPosition(800)).toBe('LOC_ARENA_1');
    });
  });

  describe('Nearby Chunks Calculation', () => {
    it('should calculate nearby chunks correctly', () => {
      const chunks = WorldService.getNearbyChunkCoordinates(0, 0, 1);
      expect(chunks).toHaveLength(9); // 3x3 grid
      
      const chunkKeys = chunks.map(c => WorldService.getChunkKey(c));
      expect(chunkKeys).toContain('0,0'); // Center
      expect(chunkKeys).toContain('-1,-1'); // Top-left
      expect(chunkKeys).toContain('1,1'); // Bottom-right
    });

    it('should handle different load distances', () => {
      const chunks0 = WorldService.getNearbyChunkCoordinates(0, 0, 0);
      const chunks1 = WorldService.getNearbyChunkCoordinates(0, 0, 1);
      const chunks2 = WorldService.getNearbyChunkCoordinates(0, 0, 2);
      
      expect(chunks0).toHaveLength(1); // 1x1
      expect(chunks1).toHaveLength(9); // 3x3
      expect(chunks2).toHaveLength(25); // 5x5
    });
  });
});