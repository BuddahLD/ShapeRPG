import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { 
  GamePhase, 
  LocationId, 
  ShopType, 
  Enemy, 
  SpellCastResult, 
  WorldZone,
  WorldChunk 
} from "../types/gameTypes";

interface GameState {
  gamePhase: GamePhase;
  currentLocation: LocationId;
  isDrawingRune: boolean;
  isSlowMotion: boolean;
  showShop: ShopType;
  enemies: Enemy[];
  nearbyNPC: string | null;
  worldZones: WorldZone[];
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  setCurrentLocation: (location: LocationId) => void;
  checkZoneTransition: (x: number, y: number) => LocationId | null;
  setDrawingRune: (drawing: boolean) => void;
  setSlowMotion: (slow: boolean) => void;
  setShowShop: (shop: ShopType) => void;
  setNearbyNPC: (npcId: string | null) => void;
  interactWithNPC: () => void;
  
  // Enemy management
  spawnEnemies: () => void;
  spawnEnemiesForZone: (zoneId: LocationId) => void;
  clearEnemies: () => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  removeEnemy: (id: string) => void;
  setEnemies: (enemies: Enemy[]) => void;
  
  // Combat
  castSpell: (result: SpellCastResult) => void;
  performCounterattack: (enemyId: string) => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    gamePhase: "hub",
    currentLocation: "LOC_HUB_FIGUREIUM",
    loadedChunks: new Map<string, WorldChunk>(),
    chunkSize: 400, // Each chunk is 400x400 units
    worldZones: [
      {
        id: "LOC_HUB_FIGUREIUM",
        bounds: { minX: -200, maxX: 200, minY: -150, maxY: 150 },
        background: "#2a5298",
        hasEnemies: false
      },
      {
        id: "LOC_PEACEFUL_FIELDS",
        bounds: { minX: 200, maxX: 600, minY: -150, maxY: 150 },
        background: "#4a7c59",
        hasEnemies: true
      },
      {
        id: "LOC_ARENA_1",
        bounds: { minX: 600, maxX: 1000, minY: -150, maxY: 150 },
        background: "#8b4513",
        hasEnemies: true
      }
    ],
    isDrawingRune: false,
    isSlowMotion: false,
    showShop: null,
    enemies: [],
    nearbyNPC: null,
    
    setGamePhase: (phase) => set({ gamePhase: phase }),
    
    setCurrentLocation: (location) => set({ 
      currentLocation: location,
      gamePhase: location === "LOC_HUB_FIGUREIUM" ? "hub" : "combat"
    }),
    
    setDrawingRune: (drawing) => {
      set({ 
        isDrawingRune: drawing,
        isSlowMotion: drawing // Enable slow motion during drawing
      });
    },
    
    setSlowMotion: (slow) => set({ isSlowMotion: slow }),
    
    setShowShop: (shop) => set({ showShop: shop }),
    
    setNearbyNPC: (npcId) => set({ nearbyNPC: npcId }),
    
    interactWithNPC: () => {
      const { nearbyNPC } = get();
      if (!nearbyNPC) return;
      
      switch (nearbyNPC) {
        case 'weapon_shop':
          set({ showShop: 'weapons' });
          break;
        case 'armor_shop':
          set({ showShop: 'armor' });
          break;
        case 'trainer':
          console.log('Trainer interface not yet implemented');
          break;
      }
    },

    checkZoneTransition: (x, y) => {
      const { worldZones, currentLocation } = get();
      
      console.log("🔍 CHECKING ZONES at position:", x, y, "current:", currentLocation);
      
      for (const zone of worldZones) {
        console.log("📍 Zone", zone.id, "bounds:", zone.bounds, "contains:", 
          x >= zone.bounds.minX && x <= zone.bounds.maxX &&
          y >= zone.bounds.minY && y <= zone.bounds.maxY);
          
        if (x >= zone.bounds.minX && x <= zone.bounds.maxX &&
            y >= zone.bounds.minY && y <= zone.bounds.maxY) {
          
          if (zone.id !== currentLocation) {
            // Zone transition detected
            console.log("🚀 ZONE TRANSITION:", currentLocation, "→", zone.id);
            set({ 
              currentLocation: zone.id,
              gamePhase: zone.id === "LOC_HUB_FIGUREIUM" ? "hub" : "combat"
            });
            
            // Spawn enemies if entering a combat zone
            if (zone.hasEnemies && zone.id !== "LOC_HUB_FIGUREIUM") {
              get().spawnEnemiesForZone(zone.id);
            } else {
              get().clearEnemies();
            }
            
            return zone.id;
          }
          return zone.id;
        }
      }
      
      return null; // Outside all zones
    },

    spawnEnemiesForZone: (zoneId: LocationId) => {
      let newEnemies: Enemy[] = [];
      
      switch (zoneId) {
        case "LOC_PEACEFUL_FIELDS":
          newEnemies = [
            {
              id: "hex1",
              type: "HEX_PEACEFUL",
              x: 350, // In the fields area
              y: -50,
              hp: 20,
              maxHp: 20,
              atk: 2,
              def: 1,
              size: 15,
              isAttacking: false,
              counterWindow: 0,
              lastAttack: 0
            },
            {
              id: "hex2",
              type: "HEX_PEACEFUL",
              x: 400,
              y: 30,
              hp: 20,
              maxHp: 20,
              atk: 2,
              def: 1,
              size: 15,
              isAttacking: false,
              counterWindow: 0,
              lastAttack: 0
            }
          ];
          break;
          
        case "LOC_ARENA_1":
          newEnemies = [
            {
              id: "arena_enemy1",
              type: "TRI_MEDIUM",
              x: 750,
              y: -30,
              hp: 60,
              maxHp: 60,
              atk: 8,
              def: 3,
              size: 25,
              isAttacking: false,
              counterWindow: 0,
              lastAttack: 0
            }
          ];
          break;
      }
      
      set({ enemies: newEnemies });
    },
    
    spawnEnemies: () => {
      const newEnemies: Enemy[] = [
        {
          id: "enemy1",
          type: "TRI_SMALL",
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100,
          hp: 30,
          maxHp: 30,
          atk: 3,
          def: 1,
          size: 20,
          isAttacking: false,
          counterWindow: 0,
          lastAttack: 0
        },
        {
          id: "enemy2",
          type: "TRI_MEDIUM",
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100,
          hp: 60,
          maxHp: 60,
          atk: 6,
          def: 2,
          size: 25,
          isAttacking: false,
          counterWindow: 0,
          lastAttack: 0
        }
      ];
      
      set({ enemies: newEnemies });
    },
    
    clearEnemies: () => set({ enemies: [] }),
    
    updateEnemy: (id, updates) => {
      set(state => ({
        enemies: state.enemies.map(enemy =>
          enemy.id === id ? { ...enemy, ...updates } : enemy
        )
      }));
    },
    
    removeEnemy: (id) => {
      set(state => ({
        enemies: state.enemies.filter(enemy => enemy.id !== id)
      }));
    },
    
    setEnemies: (enemies) => set({ enemies }),
    
    castSpell: (result) => {
      const { enemies } = get();
      
      if (result.success && result.spell) {
        // Apply spell effects to enemies
        const damage = result.spell.effect.amount * result.accuracy;
        
        // Target the nearest enemy for now
        if (enemies.length > 0) {
          const targetEnemy = enemies[0];
          const newHp = Math.max(0, targetEnemy.hp - damage);
          
          get().updateEnemy(targetEnemy.id, { hp: newHp });
          
          console.log(`Cast ${result.spell.name} for ${damage} damage!`);
        }
      } else {
        // Apply debuff to player
        console.log("Spell failed! Debuff applied.");
        // TODO: Implement debuff system
      }
      
      // Remove slow motion after casting
      setTimeout(() => {
        set({ isSlowMotion: false });
      }, 200);
    },
    
    performCounterattack: (enemyId) => {
      const enemy = get().enemies.find(e => e.id === enemyId);
      if (enemy && enemy.counterWindow > 0) {
        // Successful counterattack
        const damage = 15; // Base counterattack damage
        get().updateEnemy(enemyId, { 
          hp: Math.max(0, enemy.hp - damage),
          counterWindow: 0,
          isAttacking: false
        });
        
        console.log(`Counterattack successful! Dealt ${damage} damage to ${enemyId}`);
      }
    }
  }))
);
