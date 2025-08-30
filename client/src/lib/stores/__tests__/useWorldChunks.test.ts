import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorldChunks, generateChunkContent, CHUNK_SIZE, CHUNK_LOAD_DISTANCE } from '../useWorldChunks';
import { WorldService } from '../../services/WorldService';
import { ChunkCoordinates, Enemy, NPC } from '../../types/gameTypes';

// Mock Math.random for predictable testing
const mockMath = vi.spyOn(Math, 'random');

describe('World Chunks System', () => {
  beforeEach(() => {
    // Reset the store before each test
    useWorldChunks.setState({
      loadedChunks: new Map()
    });
    
    // Reset Math.random mock
    mockMath.mockReset();
  });

  describe('Chunk Coordinates', () => {
    it('should calculate chunk coordinates correctly', () => {
      const store = useWorldChunks.getState();
      
      expect(store.getChunkCoordinates(0, 0)).toEqual({ x: 0, y: 0 });
      expect(store.getChunkCoordinates(400, 0)).toEqual({ x: 1, y: 0 });
      expect(store.getChunkCoordinates(-400, 0)).toEqual({ x: -1, y: 0 });
      expect(store.getChunkCoordinates(200, 200)).toEqual({ x: 0, y: 0 });
      expect(store.getChunkCoordinates(500, 500)).toEqual({ x: 1, y: 1 });
    });

    it('should generate consistent chunk keys', () => {
      const store = useWorldChunks.getState();
      const coords: ChunkCoordinates = { x: 1, y: 2 };
      
      expect(store.getChunkKey(coords)).toBe('1,2');
      expect(store.getChunkKey({ x: -1, y: -2 })).toBe('-1,-2');
    });
  });

  describe('Chunk Loading', () => {
    it('should load a new chunk', () => {
      const coords: ChunkCoordinates = { x: 0, y: 0 };
      
      expect(useWorldChunks.getState().isChunkLoaded(coords)).toBe(false);
      
      const chunk = useWorldChunks.getState().loadChunk(coords);
      
      expect(chunk).toBeTruthy();
      expect(useWorldChunks.getState().isChunkLoaded(coords)).toBe(true);
      expect(chunk?.x).toBe(0);
      expect(chunk?.y).toBe(0);
      expect(chunk?.loaded).toBe(true);
    });

    it('should not reload existing chunks', () => {
      const coords: ChunkCoordinates = { x: 0, y: 0 };
      
      const firstLoad = useWorldChunks.getState().loadChunk(coords);
      const secondLoad = useWorldChunks.getState().loadChunk(coords);
      
      expect(firstLoad).toBe(secondLoad);
      expect(useWorldChunks.getState().loadedChunks.size).toBe(1);
    });

    it('should unload chunks successfully', () => {
      const store = useWorldChunks.getState();
      const coords: ChunkCoordinates = { x: 1, y: 1 };
      
      store.loadChunk(coords);
      expect(store.isChunkLoaded(coords)).toBe(true);
      
      const unloaded = store.unloadChunk(coords);
      expect(unloaded).toBe(true);
      expect(store.isChunkLoaded(coords)).toBe(false);
    });

    it('should return false when unloading non-existent chunk', () => {
      const store = useWorldChunks.getState();
      const coords: ChunkCoordinates = { x: 99, y: 99 };
      
      const unloaded = store.unloadChunk(coords);
      expect(unloaded).toBe(false);
    });
  });

  describe('Chunk Content Generation', () => {
    beforeEach(() => {
      mockMath.mockReturnValue(0.5); // Predictable random value
    });

    it('should generate NPCs in hub center chunk', () => {
      const coords: ChunkCoordinates = { x: 0, y: 0 };
      const { enemies, npcs } = generateChunkContent(coords);
      
      expect(enemies).toHaveLength(0);
      expect(npcs).toHaveLength(3);
      expect(npcs.map(npc => npc.id)).toEqual(['weapon_shop', 'armor_shop', 'trainer']);
    });

    it('should generate enemies in fields chunks', () => {
      mockMath.mockReturnValue(0.6); // Below 0.7 threshold for enemy spawning
      
      const coords: ChunkCoordinates = { x: 1, y: 0 }; // Fields area
      const { enemies, npcs } = generateChunkContent(coords);
      
      expect(npcs).toHaveLength(0);
      expect(enemies).toHaveLength(2);
      expect(enemies[0].type).toBe('HEX_PEACEFUL');
      expect(enemies[1].type).toBe('HEX_PEACEFUL');
    });

    it('should generate enemies in arena chunks', () => {
      mockMath.mockReturnValue(0.7); // Below 0.8 threshold for enemy spawning
      
      const coords: ChunkCoordinates = { x: 2, y: 0 }; // Arena area
      const { enemies, npcs } = generateChunkContent(coords);
      
      expect(npcs).toHaveLength(0);
      expect(enemies).toHaveLength(3);
      expect(enemies[0].type).toBe('TRI_ARENA');
      expect(enemies[1].type).toBe('TRI_ARENA');
      expect(enemies[2].type).toBe('TRI_ARENA');
    });

    it('should not generate enemies when probability is too high', () => {
      mockMath.mockReturnValue(0.9); // Above thresholds
      
      const fieldsCoords: ChunkCoordinates = { x: 1, y: 0 };
      const arenaCoords: ChunkCoordinates = { x: 2, y: 0 };
      
      const fieldsContent = generateChunkContent(fieldsCoords);
      const arenaContent = generateChunkContent(arenaCoords);
      
      expect(fieldsContent.enemies).toHaveLength(0);
      expect(arenaContent.enemies).toHaveLength(0);
    });
  });

  describe('Nearby Chunks Update', () => {
    it('should load chunks around player position', () => {
      const store = useWorldChunks.getState();
      
      // Player at center of chunk (0,0)
      store.updateNearbyChunks(200, 200);
      
      // Should load 5x5 grid around player (load distance = 2)
      const expectedChunks = 25; // (2*2+1)^2
      expect(store.loadedChunks.size).toBe(expectedChunks);
      
      // Check that center chunk is loaded
      expect(store.isChunkLoaded({ x: 0, y: 0 })).toBe(true);
      
      // Check that edge chunks are loaded
      expect(store.isChunkLoaded({ x: -2, y: -2 })).toBe(true);
      expect(store.isChunkLoaded({ x: 2, y: 2 })).toBe(true);
    });

    it('should unload distant chunks when player moves far away', () => {
      const store = useWorldChunks.getState();
      
      // Load chunks around (0,0)
      store.updateNearbyChunks(0, 0);
      const initialCount = store.loadedChunks.size;
      
      // Move player far away (requires chunks around (5,0))
      store.updateNearbyChunks(5 * CHUNK_SIZE, 0);
      
      // Should still have the same number of chunks but different ones
      expect(store.loadedChunks.size).toBe(initialCount);
      
      // Original center chunk should be unloaded
      expect(store.isChunkLoaded({ x: 0, y: 0 })).toBe(false);
      
      // New center chunk should be loaded
      expect(store.isChunkLoaded({ x: 5, y: 0 })).toBe(true);
    });
  });

  describe('Enemy and NPC Aggregation', () => {
    beforeEach(() => {
      mockMath.mockReturnValue(0.5); // Predictable enemy spawning
    });

    it('should aggregate enemies from all loaded chunks', () => {
      const store = useWorldChunks.getState();
      
      // Load hub chunk (no enemies)
      store.loadChunk({ x: 0, y: 0 });
      
      // Load fields chunk (2 enemies)
      store.loadChunk({ x: 1, y: 0 });
      
      const allEnemies = store.getAllEnemies();
      expect(allEnemies).toHaveLength(2);
      expect(allEnemies.every(e => e.type === 'HEX_PEACEFUL')).toBe(true);
    });

    it('should aggregate NPCs from all loaded chunks', () => {
      const store = useWorldChunks.getState();
      
      // Load hub center chunk (3 NPCs)
      store.loadChunk({ x: 0, y: 0 });
      
      // Load other chunks (no NPCs)
      store.loadChunk({ x: 1, y: 0 });
      store.loadChunk({ x: 2, y: 0 });
      
      const allNPCs = store.getAllNPCs();
      expect(allNPCs).toHaveLength(3);
      expect(allNPCs.map(npc => npc.id)).toEqual(['weapon_shop', 'armor_shop', 'trainer']);
    });

    it('should return empty arrays when no chunks are loaded', () => {
      const store = useWorldChunks.getState();
      
      expect(store.getAllEnemies()).toHaveLength(0);
      expect(store.getAllNPCs()).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative chunk coordinates', () => {
      const store = useWorldChunks.getState();
      const coords: ChunkCoordinates = { x: -1, y: -1 };
      
      const chunk = store.loadChunk(coords);
      expect(chunk?.x).toBe(-1);
      expect(chunk?.y).toBe(-1);
      expect(store.getChunkKey(coords)).toBe('-1,-1');
    });

    it('should handle large coordinate values', () => {
      const store = useWorldChunks.getState();
      const coords: ChunkCoordinates = { x: 1000, y: 1000 };
      
      const chunk = store.loadChunk(coords);
      expect(chunk?.x).toBe(1000);
      expect(chunk?.y).toBe(1000);
    });
  });

  describe('Performance Considerations', () => {
    it('should not exceed maximum loaded chunks during player movement', () => {
      const store = useWorldChunks.getState();
      const maxExpectedChunks = (CHUNK_LOAD_DISTANCE * 2 + 1) ** 2;
      
      // Simulate player moving across different areas
      const positions = [
        [0, 0],
        [CHUNK_SIZE, 0],
        [CHUNK_SIZE * 2, 0],
        [CHUNK_SIZE * 3, 0],
        [CHUNK_SIZE * 4, 0]
      ];
      
      positions.forEach(([x, y]) => {
        store.updateNearbyChunks(x, y);
        expect(store.loadedChunks.size).toBeLessThanOrEqual(maxExpectedChunks + 5); // Small buffer for edge cases
      });
    });

    it('should efficiently reuse chunks when player backtracks', () => {
      const store = useWorldChunks.getState();
      
      // Load chunks at position 1
      store.updateNearbyChunks(0, 0);
      const chunksAfterFirst = new Set(store.loadedChunks.keys());
      
      // Move away
      store.updateNearbyChunks(CHUNK_SIZE * 5, 0);
      
      // Move back to original position
      store.updateNearbyChunks(0, 0);
      const chunksAfterReturn = new Set(store.loadedChunks.keys());
      
      // Should have reloaded the same chunks
      expect(chunksAfterReturn).toEqual(chunksAfterFirst);
    });
  });
});