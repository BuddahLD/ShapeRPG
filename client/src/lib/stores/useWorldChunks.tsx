import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { LocationId } from '../types/gameTypes';

interface WorldChunk {
  x: number;
  y: number;
  loaded: boolean;
  enemies: any[];
  npcs: any[];
  walls: { x: number; y: number; width: number; height: number }[];
}

interface ChunkState {
  loadedChunks: Map<string, WorldChunk>;
  chunkSize: number;
  
  // Actions
  getChunkKey: (chunkX: number, chunkY: number) => string;
  loadChunk: (chunkX: number, chunkY: number) => void;
  unloadChunk: (chunkX: number, chunkY: number) => void;
  updateLoadedChunks: (playerX: number, playerY: number) => void;
  getVisibleEnemies: () => any[];
}

export const useWorldChunks = create<ChunkState>()(
  subscribeWithSelector((set, get) => ({
    loadedChunks: new Map<string, WorldChunk>(),
    chunkSize: 400, // Each chunk is 400x400 units
    
    getChunkKey: (chunkX: number, chunkY: number) => {
      return `${chunkX},${chunkY}`;
    },
    
    loadChunk: (chunkX: number, chunkY: number) => {
      const chunkKey = get().getChunkKey(chunkX, chunkY);
      const { loadedChunks, chunkSize } = get();
      
      if (loadedChunks.has(chunkKey)) return;
      
      const worldX = chunkX * chunkSize;
      const worldY = chunkY * chunkSize;
      
      // Create chunk data based on world position
      const newChunk: WorldChunk = {
        x: chunkX,
        y: chunkY,
        loaded: true,
        enemies: [],
        npcs: [],
        walls: []
      };
      
      // Determine what zone this chunk belongs to
      const centerX = worldX + chunkSize / 2;
      
      // Hub chunk
      if (centerX >= -200 && centerX <= 200) {
        if (chunkX === 0 && chunkY === 0) { // Center hub chunk
          newChunk.npcs = [
            { id: "weapon_shop", x: -80, y: -50, type: "shop" },
            { id: "armor_shop", x: 80, y: -50, type: "shop" },
            { id: "trainer", x: 0, y: -80, type: "trainer" }
          ];
        }
      }
      // Fields chunk
      else if (centerX >= 200 && centerX <= 600) {
        if (Math.random() < 0.7) { // 70% chance for enemies in fields
          for (let i = 0; i < 2; i++) {
            newChunk.enemies.push({
              id: `hex_${chunkKey}_${i}`,
              type: "HEX_PEACEFUL",
              x: worldX + Math.random() * chunkSize,
              y: worldY + Math.random() * chunkSize,
              hp: 20,
              maxHp: 20,
              atk: 2,
              def: 1,
              size: 15,
              isAttacking: false,
              counterWindow: 0,
              lastAttack: 0
            });
          }
        }
      }
      // Arena chunk
      else if (centerX >= 600 && centerX <= 1000) {
        if (Math.random() < 0.8) { // 80% chance for enemies in arena
          for (let i = 0; i < 3; i++) {
            newChunk.enemies.push({
              id: `tri_${chunkKey}_${i}`,
              type: "TRI_ARENA",
              x: worldX + Math.random() * chunkSize,
              y: worldY + Math.random() * chunkSize,
              hp: 60,
              maxHp: 60,
              atk: 12,
              def: 5,
              size: 20,
              isAttacking: false,
              counterWindow: 0,
              lastAttack: 0
            });
          }
        }
      }
      
      const newLoadedChunks = new Map(loadedChunks);
      newLoadedChunks.set(chunkKey, newChunk);
      
      set({ loadedChunks: newLoadedChunks });
    },
    
    unloadChunk: (chunkX: number, chunkY: number) => {
      const chunkKey = get().getChunkKey(chunkX, chunkY);
      const { loadedChunks } = get();
      
      if (loadedChunks.has(chunkKey)) {
        const newLoadedChunks = new Map(loadedChunks);
        newLoadedChunks.delete(chunkKey);
        set({ loadedChunks: newLoadedChunks });
      }
    },
    
    updateLoadedChunks: (playerX: number, playerY: number) => {
      const { chunkSize } = get();
      const loadDistance = 2; // Load chunks within 2 chunk radius
      
      const playerChunkX = Math.floor(playerX / chunkSize);
      const playerChunkY = Math.floor(playerY / chunkSize);
      
      // Load nearby chunks
      for (let dx = -loadDistance; dx <= loadDistance; dx++) {
        for (let dy = -loadDistance; dy <= loadDistance; dy++) {
          const chunkX = playerChunkX + dx;
          const chunkY = playerChunkY + dy;
          get().loadChunk(chunkX, chunkY);
        }
      }
      
      // Unload distant chunks
      const { loadedChunks } = get();
      const chunksToUnload: string[] = [];
      
      loadedChunks.forEach((chunk, key) => {
        const distance = Math.max(
          Math.abs(chunk.x - playerChunkX),
          Math.abs(chunk.y - playerChunkY)
        );
        
        if (distance > loadDistance + 1) {
          chunksToUnload.push(key);
        }
      });
      
      chunksToUnload.forEach(key => {
        const [chunkX, chunkY] = key.split(',').map(Number);
        get().unloadChunk(chunkX, chunkY);
      });
    },
    
    getVisibleEnemies: () => {
      const { loadedChunks } = get();
      const allEnemies: any[] = [];
      
      loadedChunks.forEach(chunk => {
        allEnemies.push(...chunk.enemies);
      });
      
      return allEnemies;
    }
  }))
);