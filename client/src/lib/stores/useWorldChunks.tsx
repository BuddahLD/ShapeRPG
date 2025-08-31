import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { WorldChunk, Enemy, NPC, ChunkCoordinates } from '../types/gameTypes';
import { WorldService } from '../services/WorldService';

// Constants for configuration
export const CHUNK_SIZE = 400;
export const CHUNK_LOAD_DISTANCE = 2;

interface ChunkState {
  loadedChunks: Map<string, WorldChunk>;
  
  // Core actions
  loadChunk: (coordinates: ChunkCoordinates) => WorldChunk | null;
  unloadChunk: (coordinates: ChunkCoordinates) => boolean;
  updateNearbyChunks: (playerX: number, playerY: number) => void;
  getAllEnemies: () => Enemy[];
  getAllNPCs: () => NPC[];
  
  // Utility functions
  getChunkCoordinates: (worldX: number, worldY: number) => ChunkCoordinates;
  getChunkKey: (coordinates: ChunkCoordinates) => string;
  isChunkLoaded: (coordinates: ChunkCoordinates) => boolean;
}

// Chunk generation logic separated for testability
export const generateChunkContent = (coordinates: ChunkCoordinates): { enemies: Enemy[], npcs: NPC[] } => {
  const { x: chunkX, y: chunkY } = coordinates;
  const worldX = chunkX * CHUNK_SIZE;
  const centerX = worldX + CHUNK_SIZE / 2;
  
  const chunkKey = `${chunkX},${chunkY}`;
  const enemies: Enemy[] = [];
  const npcs: NPC[] = [];
  
  // Get zone configuration for this position
  const zoneConfig = WorldService.getZoneConfigForPosition(centerX);
  
  if (zoneConfig) {
    // Hub chunks (NPCs only in center chunk)
    if (zoneConfig.id === 'LOC_HUB_FIGUREIUM' && chunkX === 0 && chunkY === 0) {
      npcs.push(
        { id: "weapon_shop", x: -80, y: -50, type: "shop" },
        { id: "armor_shop", x: 80, y: -50, type: "shop" },
        { id: "trainer", x: 0, y: -80, type: "trainer" }
      );
    }
    
    // Generate enemies based on zone configuration
    if (zoneConfig.allowsEnemySpawning && zoneConfig.enemyTypes) {
      zoneConfig.enemyTypes.forEach(enemyType => {
        if (Math.random() < enemyType.spawnRate) {
          for (let i = 0; i < enemyType.count; i++) {
            enemies.push({
              id: `${enemyType.type.toLowerCase()}_${chunkKey}_${i}`,
              type: enemyType.type,
              x: worldX + Math.random() * CHUNK_SIZE,
              y: chunkY * CHUNK_SIZE + Math.random() * CHUNK_SIZE,
              hp: enemyType.stats.hp,
              maxHp: enemyType.stats.maxHp,
              atk: enemyType.stats.atk,
              def: enemyType.stats.def,
              size: enemyType.stats.size,
              isAttacking: false,
              counterWindow: 0,
              lastAttack: 0
            });
          }
        }
      });
    }
  }
  
  return { enemies, npcs };
};

export const useWorldChunks = create<ChunkState>()(
  subscribeWithSelector((set, get) => ({
    loadedChunks: new Map<string, WorldChunk>(),
    
    getChunkCoordinates: WorldService.getChunkCoordinates,
    
    getChunkKey: WorldService.getChunkKey,
    
    isChunkLoaded: (coordinates: ChunkCoordinates) => {
      const key = get().getChunkKey(coordinates);
      return get().loadedChunks.has(key);
    },
    
    loadChunk: (coordinates: ChunkCoordinates) => {
      const key = get().getChunkKey(coordinates);
      const { loadedChunks } = get();
      
      if (loadedChunks.has(key)) {
        return loadedChunks.get(key) || null;
      }
      
      // Generate chunk content
      const { enemies, npcs } = generateChunkContent(coordinates);
      
      const newChunk: WorldChunk = {
        x: coordinates.x,
        y: coordinates.y,
        loaded: true,
        enemies,
        npcs,
        walls: []
      };
      
      const newLoadedChunks = new Map(loadedChunks);
      newLoadedChunks.set(key, newChunk);
      
      set({ loadedChunks: newLoadedChunks });
      return newChunk;
    },
    
    unloadChunk: (coordinates: ChunkCoordinates) => {
      const key = get().getChunkKey(coordinates);
      const { loadedChunks } = get();
      
      if (loadedChunks.has(key)) {
        const newLoadedChunks = new Map(loadedChunks);
        newLoadedChunks.delete(key);
        set({ loadedChunks: newLoadedChunks });
        return true;
      }
      return false;
    },
    
    updateNearbyChunks: (playerX: number, playerY: number) => {
      const { loadedChunks } = get();
      
      // Load nearby chunks using service
      const chunksToLoad = WorldService.getNearbyChunkCoordinates(playerX, playerY, CHUNK_LOAD_DISTANCE);
      chunksToLoad.forEach(coords => {
        if (!get().isChunkLoaded(coords)) {
          get().loadChunk(coords);
        }
      });
      
      // Unload distant chunks using service
      const chunksToUnload = WorldService.getChunksToUnload(loadedChunks, playerX, playerY, CHUNK_LOAD_DISTANCE);
      chunksToUnload.forEach(coords => {
        get().unloadChunk(coords);
      });
    },
    
    getAllEnemies: () => {
      const { loadedChunks } = get();
      const allEnemies: Enemy[] = [];
      
      loadedChunks.forEach(chunk => {
        allEnemies.push(...chunk.enemies);
      });
      
      return allEnemies;
    },
    
    getAllNPCs: () => {
      const { loadedChunks } = get();
      const allNPCs: NPC[] = [];
      
      loadedChunks.forEach(chunk => {
        allNPCs.push(...chunk.npcs);
      });
      
      return allNPCs;
    }
  }))
);