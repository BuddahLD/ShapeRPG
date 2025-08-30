import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface InventoryItem {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable";
  atk?: number;
  def?: number;
  hp?: number;
  mana?: number;
  cost: number;
  equipped?: boolean;
}

interface InventoryState {
  items: InventoryItem[];
  
  // Actions
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  getEquippedItems: () => InventoryItem[];
}

export const useInventory = create<InventoryState>()(
  subscribeWithSelector((set, get) => ({
    items: [],
    
    addItem: (item) => {
      set(state => ({
        items: [...state.items, { ...item, equipped: false }]
      }));
    },
    
    removeItem: (itemId) => {
      set(state => ({
        items: state.items.filter(item => item.id !== itemId)
      }));
    },
    
    equipItem: (itemId) => {
      set(state => {
        const item = state.items.find(i => i.id === itemId);
        if (!item) return {};
        
        // Unequip other items of the same type
        const updatedItems = state.items.map(i => 
          i.type === item.type && i.id !== itemId 
            ? { ...i, equipped: false }
            : i.id === itemId 
              ? { ...i, equipped: true }
              : i
        );
        
        return { items: updatedItems };
      });
    },
    
    unequipItem: (itemId) => {
      set(state => ({
        items: state.items.map(item => 
          item.id === itemId ? { ...item, equipped: false } : item
        )
      }));
    },
    
    getEquippedItems: () => {
      return get().items.filter(item => item.equipped);
    }
  }))
);
