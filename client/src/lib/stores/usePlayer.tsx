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
  checkCollision: (x: number, y: number) => boolean;
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
        x: 0,   // Center of the room
        y: 20,  // Slightly below center, away from trainer
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
        if (!state.player) {
          return {};
        }
        
        
        const MOVEMENT_SPEED = 2;
        const newX = state.player.x + dx * MOVEMENT_SPEED;
        const newY = state.player.y + dy * MOVEMENT_SPEED;
        
        
        // If no movement input, just update velocities to 0
        if (dx === 0 && dy === 0) {
          return {
            player: {
              ...state.player,
              vx: 0,
              vy: 0
            }
          };
        }
        
        // Check collisions for hub location only
        const canMove = get().checkCollision(newX, newY);
        
        if (!canMove) {
          // Try moving only in X direction
          const canMoveX = get().checkCollision(newX, state.player.y);
          if (canMoveX) {
            return {
              player: {
                ...state.player,
                x: newX,
                y: state.player.y,
                vx: dx * MOVEMENT_SPEED,
                vy: 0
              }
            };
          }
          
          // Try moving only in Y direction
          const canMoveY = get().checkCollision(state.player.x, newY);
          if (canMoveY) {
            return {
              player: {
                ...state.player,
                x: state.player.x,
                y: newY,
                vx: 0,
                vy: dy * MOVEMENT_SPEED
              }
            };
          }
          
          // Can't move in either direction - stop movement
          return {
            player: {
              ...state.player,
              vx: 0,
              vy: 0
            }
          };
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
    },

    checkCollision: (x, y) => {
      const playerRadius = 15;

      // Hub walls - more conservative boundaries
      const walls = [
        { x: -180, y: -130, width: 360, height: 20 }, // Top wall
        { x: -180, y: 110, width: 360, height: 20 },  // Bottom wall  
        { x: -180, y: -130, width: 20, height: 260 }, // Left wall
        { x: 160, y: -130, width: 20, height: 260 },  // Right wall
      ];

      // NPCs with smaller collision radius
      const npcs = [
        { x: -80, y: -50, radius: 22 }, // Weapon shop
        { x: 80, y: -50, radius: 22 },  // Armor shop
        { x: 0, y: -80, radius: 22 },   // Trainer
      ];

      // Check wall collisions
      for (const wall of walls) {
        if (x + playerRadius > wall.x && 
            x - playerRadius < wall.x + wall.width && 
            y + playerRadius > wall.y && 
            y - playerRadius < wall.y + wall.height) {
          return false;
        }
      }

      // Check NPC collisions
      for (const npc of npcs) {
        const distance = Math.sqrt((x - npc.x) ** 2 + (y - npc.y) ** 2);
        if (distance < playerRadius + npc.radius) {
          return false;
        }
      }

      return true; // No collision
    }
  }))
);
