import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { gameData } from "../gameData/gameData";

interface PlayerStats {
  hp: number;
  mana: number;
  atk: number;
  def: number;
  castSpeed: number;
}

interface Player {
  level: number;
  xp: number;
  gold: number;
  stats: PlayerStats;
  spells: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface PlayerState {
  player: Player | null;
  
  // Actions
  initializePlayer: () => void;
  updatePlayer: (updates: Partial<Player>) => void;
  movePlayer: (dx: number, dy: number) => void;
  addXP: (amount: number) => void;
  addGold: (amount: number) => void;
  learnSpell: (spellId: string) => void;
}

const MOVEMENT_SPEED = 2;

export const usePlayer = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
    player: null,
    
    initializePlayer: () => {
      const initialPlayer: Player = {
        level: gameData.hero_start.level,
        xp: gameData.hero_start.xp,
        gold: 0,
        stats: { ...gameData.hero_start.stats },
        spells: [...gameData.hero_start.spells],
        x: 0,
        y: 0,
        vx: 0,
        vy: 0
      };
      
      set({ player: initialPlayer });
    },
    
    updatePlayer: (updates) => {
      set(state => ({
        player: state.player ? { ...state.player, ...updates } : null
      }));
    },
    
    movePlayer: (dx, dy) => {
      set(state => {
        if (!state.player) return {};
        
        const newX = state.player.x + dx * MOVEMENT_SPEED;
        const newY = state.player.y + dy * MOVEMENT_SPEED;
        
        // Add debug logging for significant movement
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          console.log(`Player moving: dx=${dx.toFixed(2)}, dy=${dy.toFixed(2)}, newX=${newX.toFixed(1)}, newY=${newY.toFixed(1)}`);
        }
        
        return {
          player: {
            ...state.player,
            x: newX,
            y: newY,
            vx: dx * MOVEMENT_SPEED,
            vy: dy * MOVEMENT_SPEED
          }
        };
      });
    },
    
    addXP: (amount) => {
      set(state => {
        if (!state.player) return {};
        
        const newXP = state.player.xp + amount;
        const xpRequired = 100 * Math.pow(state.player.level, 2);
        
        let newLevel = state.player.level;
        let remainingXP = newXP;
        
        // Check for level up
        while (remainingXP >= xpRequired) {
          remainingXP -= xpRequired;
          newLevel++;
          
          // Level up bonus - add stat point
          // For now, just increase HP and Mana
          const updatedStats = {
            ...state.player.stats,
            hp: Math.min(state.player.stats.hp + 10, 100 + (newLevel * 10)),
            mana: Math.min(state.player.stats.mana + 5, 50 + (newLevel * 5))
          };
          
          console.log(`Level up! Now level ${newLevel}`);
          
          return {
            player: {
              ...state.player,
              level: newLevel,
              xp: remainingXP,
              stats: updatedStats
            }
          };
        }
        
        return {
          player: {
            ...state.player,
            xp: remainingXP
          }
        };
      });
    },
    
    addGold: (amount) => {
      set(state => ({
        player: state.player ? {
          ...state.player,
          gold: state.player.gold + amount
        } : null
      }));
    },
    
    learnSpell: (spellId) => {
      set(state => {
        if (!state.player) return {};
        
        if (!state.player.spells.includes(spellId)) {
          return {
            player: {
              ...state.player,
              spells: [...state.player.spells, spellId]
            }
          };
        }
        
        return {};
      });
    }
  }))
);
