/**
 * Presentation Hook: Player Manager Integration
 * Provides React hooks for accessing the PlayerManager
 */

import { useEffect, useRef } from 'react';
import { PlayerManager } from '../managers/PlayerManager';

let playerManagerInstance: PlayerManager | null = null;

export function usePlayerManager() {
  const managerRef = useRef<PlayerManager | null>(null);

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new PlayerManager();
      playerManagerInstance = managerRef.current;
    }
  }, []);

  return managerRef.current;
}

// Hook for accessing the player store (backward compatibility)
export function usePlayer() {
  const manager = usePlayerManager();
  
  if (!manager) {
    // Return default state while manager initializes
    return {
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
      position: { x: 0, y: 0 },
      initializePlayer: () => {},
      updateStats: () => {},
      addGold: () => {},
      spendGold: () => false,
      addItem: () => {},
      removeItem: () => false,
      learnSpell: () => {},
      updatePosition: () => {},
      movePlayer: () => {},
      experienceProgress: 0,
      canLevelUp: false
    };
  }

  // Use the Zustand hook pattern to get reactive state and actions
  const store = manager.getStore();
  return store.getState();
}