/**
 * Presentation Hook: Player Manager Integration
 * Provides React hooks for accessing player data through GameStateManager
 */

import { GameStateService } from '../GameStateService';

export function usePlayerManager() {
  // Use singleton GameStateManager instance
  return GameStateService.getInstance();
}

// Hook for accessing the player data from GameStateManager
export function usePlayer() {
  const manager = usePlayerManager();
  
  if (!manager) {
    console.log('usePlayer: No manager, returning default state');
    // Return default state while manager initializes
    return {
      player: null,
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
      initializePlayer: () => {},
      updateStats: () => {},
      addGold: () => {},
      spendGold: () => false,
      addItem: () => {},
      removeItem: () => false,
      learnSpell: () => {},
      updatePosition: () => {},
      movePlayer: () => {},
      resetToHubSpawn: () => {},
      experienceProgress: 0,
      canLevelUp: false
    };
  }

  // Use the Zustand store properly - get the store instance
  const store = manager.getStore();
  
  if (!store) {
    console.log('usePlayer: Store is null, returning default state');
    return {
      player: null,
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
      initializePlayer: () => {},
      updateStats: () => {},
      addGold: () => {},
      spendGold: () => false,
      addItem: () => {},
      removeItem: () => false,
      learnSpell: () => {},
      updatePosition: () => {},
      movePlayer: () => {},
      resetToHubSpawn: () => {},
      experienceProgress: 0,
      canLevelUp: false
    };
  }
  
  // Use Zustand store as a hook for reactivity
  const state = store();
  
  // Extract player data from gameState
  const player = state.gameState.player;
  
  return {
    player,
    stats: player ? {
      hp: player.stats.hp,
      maxHp: player.stats.maxHp,
      mana: player.stats.mana,
      maxMana: player.stats.maxMana,
      attack: player.stats.attack,
      defense: player.stats.defense,
      castSpeed: 1.0
    } : {
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      attack: 10,
      defense: 5,
      castSpeed: 1.0
    },
    level: player?.level || 1,
    experience: player?.experience || 0,
    gold: player?.gold || 100,
    inventory: player?.inventory || [],
    knownSpells: player?.knownSpells || ['fire-bolt', 'ice-shard', 'shield-aura'],
    position: player?.position || { x: 0, y: 20 },
    initializePlayer: state.initializeGame,
    updateStats: () => {},
    addGold: () => {},
    spendGold: () => false,
    addItem: () => {},
    removeItem: () => false,
    learnSpell: () => {},
    updatePosition: () => {},
    movePlayer: state.movePlayer,
    resetToHubSpawn: () => {},
    experienceProgress: 0,
    canLevelUp: false
  };
}