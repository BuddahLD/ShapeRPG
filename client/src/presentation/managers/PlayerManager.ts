/**
 * Presentation Manager: Player Management
 * Manages player-related UI state and operations
 */

import { create } from 'zustand';
import { Player } from '../../domain/entities/Player';

// UI Models for player data
export interface UIPlayerStats {
  readonly hp: number;
  readonly maxHp: number;
  readonly mana: number;
  readonly maxMana: number;
  readonly attack: number;
  readonly defense: number;
  readonly castSpeed: number;
}

export interface UIPlayerInventory {
  readonly gold: number;
  readonly items: UIItem[];
}

export interface UIItem {
  readonly id: string;
  readonly name: string;
  readonly type: 'weapon' | 'armor' | 'consumable' | 'misc';
  readonly quantity: number;
  readonly description: string;
}

// Store interface following existing patterns
interface PlayerStore {
  // State
  stats: UIPlayerStats;
  level: number;
  experience: number;
  gold: number;
  inventory: UIItem[];
  knownSpells: string[];
  position: { x: number; y: number };
  
  // Actions
  initializePlayer: () => void;
  updateStats: (newStats: Partial<UIPlayerStats>) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addItem: (item: UIItem) => void;
  removeItem: (itemId: string, quantity?: number) => boolean;
  learnSpell: (spellId: string) => void;
  updatePosition: (position: { x: number; y: number }) => void;
  movePlayer: (dx: number, dy: number) => void;
  resetToHubSpawn: () => void;
  
  // Computed values
  experienceProgress: number;
  canLevelUp: boolean;
}

export class PlayerManager {
  private store: any;

  constructor() {
    console.log('PlayerManager: Constructor called');
    this.createStore();
    console.log('PlayerManager: Store created');
  }

  private createStore() {
    console.log('PlayerManager: Creating store...');
    this.store = create<PlayerStore>((set, get) => ({
      // Initial state matching existing patterns
      stats: {
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        attack: 10,
        defense: 5,
        castSpeed: 1.0
      },
      level: 1,
      experience: 0,
      gold: 100,
      inventory: [],
      knownSpells: ['fire-bolt', 'ice-shard', 'shield-aura'],
      position: { x: 0, y: 0 }, // Spawn at center of hub, near all NPCs

      // Actions
      initializePlayer: () => {
        set({
          stats: {
            hp: 100,
            maxHp: 100,
            mana: 50,
            maxMana: 50,
            attack: 10,
            defense: 5,
            castSpeed: 1.0
          },
          level: 1,
          experience: 0,
          gold: 100,
          inventory: [],
          knownSpells: ['fire-bolt', 'ice-shard', 'shield-aura'],
          position: { x: 0, y: 0 } // Spawn at center of hub, near all NPCs
        });
      },

      updateStats: (newStats: Partial<UIPlayerStats>) => {
        set(state => ({
          stats: { ...state.stats, ...newStats }
        }));
      },

      addGold: (amount: number) => {
        set(state => ({
          gold: state.gold + amount
        }));
      },

      spendGold: (amount: number) => {
        const currentGold = get().gold;
        if (currentGold >= amount) {
          set(state => ({
            gold: state.gold - amount
          }));
          return true;
        }
        return false;
      },

      addItem: (item: UIItem) => {
        set(state => {
          const existingItemIndex = state.inventory.findIndex(i => i.id === item.id);
          if (existingItemIndex >= 0) {
            // Update quantity if item exists
            const updatedInventory = [...state.inventory];
            updatedInventory[existingItemIndex] = {
              ...updatedInventory[existingItemIndex],
              quantity: updatedInventory[existingItemIndex].quantity + item.quantity
            };
            return { inventory: updatedInventory };
          } else {
            // Add new item
            return { inventory: [...state.inventory, item] };
          }
        });
      },

      removeItem: (itemId: string, quantity: number = 1) => {
        const state = get();
        const itemIndex = state.inventory.findIndex(i => i.id === itemId);
        
        if (itemIndex >= 0) {
          const item = state.inventory[itemIndex];
          if (item.quantity >= quantity) {
            set(state => {
              const updatedInventory = [...state.inventory];
              if (item.quantity === quantity) {
                // Remove item completely
                updatedInventory.splice(itemIndex, 1);
              } else {
                // Reduce quantity
                updatedInventory[itemIndex] = {
                  ...item,
                  quantity: item.quantity - quantity
                };
              }
              return { inventory: updatedInventory };
            });
            return true;
          }
        }
        return false;
      },

      learnSpell: (spellId: string) => {
        set(state => {
          if (!state.knownSpells.includes(spellId)) {
            return { knownSpells: [...state.knownSpells, spellId] };
          }
          return state;
        });
      },

      updatePosition: (position: { x: number; y: number }) => {
        set({ position });
      },

      movePlayer: (dx: number, dy: number) => {
        set(state => {
          const MOVEMENT_SPEED = 2;
          const newX = state.position.x + dx * MOVEMENT_SPEED;
          const newY = state.position.y + dy * MOVEMENT_SPEED;
          
          // For now, simple movement without collision detection
          // TODO: Integrate with proper collision system and world chunks
          return {
            position: { x: newX, y: newY }
          };
        });
      },

      resetToHubSpawn: () => {
        set({
          position: { x: 0, y: 0 } // Reset to hub spawn position
        });
      },

      // Computed values
      get experienceProgress() {
        const state = get();
        const required = 100 * Math.pow(state.level, 2);
        return required > 0 ? state.experience / required : 1;
      },

      get canLevelUp() {
        const state = get();
        const required = 100 * Math.pow(state.level, 2);
        return state.experience >= required;
      }
    }));
  }

  getStore() {
    console.log('PlayerManager: getStore called, store exists:', !!this.store);
    if (this.store) {
      const state = this.store.getState();
      console.log('PlayerManager: Store state:', state);
      return this.store;
    } else {
      console.log('PlayerManager: Store is undefined!');
      return null;
    }
  }

  // Adapter methods to sync with domain models
  syncFromDomainPlayer(player: Player) {
    const store = this.store.getState();
    
    // Update all player data from domain model
    this.store.setState({
      stats: {
        hp: player.stats.hp,
        maxHp: player.stats.maxHp,
        mana: player.stats.mana,
        maxMana: player.stats.maxMana,
        attack: player.stats.attack,
        defense: player.stats.defense,
        castSpeed: player.stats.castSpeed
      },
      level: player.level,
      experience: player.experience,
      gold: player.gold,
      knownSpells: Array.from(player.knownSpells),
      position: player.position
    });
  }

  toDomainPlayer(playerId: string): Player {
    const state = this.store.getState();
    
    return new Player(
      playerId,
      state.position,
      state.stats,
      state.level,
      state.experience,
      state.gold,
      state.knownSpells
    );
  }
}