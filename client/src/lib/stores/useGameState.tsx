import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "hub" | "combat" | "ended";
export type LocationId = "LOC_HUB_FIGUREIUM" | "LOC_ARENA_1";
export type ShopType = "weapons" | "armor" | null;

interface Enemy {
  id: string;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  size: number;
  isAttacking: boolean;
  counterWindow: number;
  lastAttack: number;
}

interface SpellCastResult {
  spell: any;
  accuracy: number;
  success: boolean;
}

interface GameState {
  gamePhase: GamePhase;
  currentLocation: LocationId;
  isDrawingRune: boolean;
  isSlowMotion: boolean;
  showShop: ShopType;
  enemies: Enemy[];
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  setCurrentLocation: (location: LocationId) => void;
  setDrawingRune: (drawing: boolean) => void;
  setSlowMotion: (slow: boolean) => void;
  setShowShop: (shop: ShopType) => void;
  
  // Enemy management
  spawnEnemies: () => void;
  clearEnemies: () => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  removeEnemy: (id: string) => void;
  
  // Combat
  castSpell: (result: SpellCastResult) => void;
  performCounterattack: (enemyId: string) => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    gamePhase: "hub",
    currentLocation: "LOC_HUB_FIGUREIUM",
    isDrawingRune: false,
    isSlowMotion: false,
    showShop: null,
    enemies: [],
    
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
