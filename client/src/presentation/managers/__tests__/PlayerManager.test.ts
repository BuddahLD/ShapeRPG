/**
 * Unit Tests: PlayerManager
 * Tests the presentation layer manager for player-related operations
 */

import { PlayerManager } from '../PlayerManager';
import { Player } from '../../../domain/entities/Player';

describe('PlayerManager', () => {
  let playerManager: PlayerManager;

  beforeEach(() => {
    playerManager = new PlayerManager();
  });

  describe('initialization', () => {
    it('should create manager with default player state', () => {
      const store = playerManager.getStore();
      const state = store.getState();

      expect(state.stats.hp).toBe(100);
      expect(state.stats.maxHp).toBe(100);
      expect(state.stats.mana).toBe(50);
      expect(state.stats.maxMana).toBe(50);
      expect(state.stats.attack).toBe(10);
      expect(state.stats.defense).toBe(5);
      expect(state.stats.castSpeed).toBe(1.0);
      expect(state.level).toBe(1);
      expect(state.experience).toBe(0);
      expect(state.gold).toBe(100);
      expect(state.inventory).toEqual([]);
      expect(state.knownSpells).toEqual(['fire-bolt', 'ice-shard', 'shield-aura']);
      expect(state.position).toEqual({ x: 0, y: 0 });
    });

    it('should provide computed values', () => {
      const store = playerManager.getStore();
      const state = store.getState();

      expect(state.experienceProgress).toBe(0); // 0 / 100 = 0
      expect(state.canLevelUp).toBe(false);
    });
  });

  describe('player initialization', () => {
    it('should reset player to default state', () => {
      const store = playerManager.getStore();
      
      // Change some values first
      store.getState().updateStats({ hp: 50, mana: 25 });
      store.getState().addGold(200);
      store.getState().updatePosition({ x: 100, y: 200 });

      expect(store.getState().stats.hp).toBe(50);
      expect(store.getState().gold).toBe(300);
      expect(store.getState().position.x).toBe(100);

      // Initialize should reset everything
      store.getState().initializePlayer();

      const state = store.getState();
      expect(state.stats.hp).toBe(100);
      expect(state.stats.maxHp).toBe(100);
      expect(state.stats.mana).toBe(50);
      expect(state.gold).toBe(100);
      expect(state.level).toBe(1);
      expect(state.experience).toBe(0);
      expect(state.position).toEqual({ x: 0, y: 0 });
      expect(state.knownSpells).toEqual(['fire-bolt', 'ice-shard', 'shield-aura']);
    });
  });

  describe('stats management', () => {
    it('should update individual stats', () => {
      const store = playerManager.getStore();
      
      store.getState().updateStats({ hp: 75, attack: 15 });

      const state = store.getState();
      expect(state.stats.hp).toBe(75);
      expect(state.stats.attack).toBe(15);
      expect(state.stats.mana).toBe(50); // unchanged
      expect(state.stats.defense).toBe(5); // unchanged
    });

    it('should update multiple stats at once', () => {
      const store = playerManager.getStore();
      
      store.getState().updateStats({
        hp: 90,
        maxHp: 120,
        mana: 60,
        maxMana: 80,
        attack: 20,
        defense: 12,
        castSpeed: 1.5
      });

      const state = store.getState();
      expect(state.stats.hp).toBe(90);
      expect(state.stats.maxHp).toBe(120);
      expect(state.stats.mana).toBe(60);
      expect(state.stats.maxMana).toBe(80);
      expect(state.stats.attack).toBe(20);
      expect(state.stats.defense).toBe(12);
      expect(state.stats.castSpeed).toBe(1.5);
    });
  });

  describe('gold management', () => {
    it('should add gold correctly', () => {
      const store = playerManager.getStore();
      
      expect(store.getState().gold).toBe(100);
      
      store.getState().addGold(50);
      expect(store.getState().gold).toBe(150);
      
      store.getState().addGold(25);
      expect(store.getState().gold).toBe(175);
    });

    it('should spend gold when sufficient funds available', () => {
      const store = playerManager.getStore();
      
      expect(store.getState().gold).toBe(100);
      
      const success = store.getState().spendGold(30);
      expect(success).toBe(true);
      expect(store.getState().gold).toBe(70);
    });

    it('should not spend gold when insufficient funds', () => {
      const store = playerManager.getStore();
      
      expect(store.getState().gold).toBe(100);
      
      const success = store.getState().spendGold(150);
      expect(success).toBe(false);
      expect(store.getState().gold).toBe(100); // unchanged
    });

    it('should handle exact gold amount', () => {
      const store = playerManager.getStore();
      
      expect(store.getState().gold).toBe(100);
      
      const success = store.getState().spendGold(100);
      expect(success).toBe(true);
      expect(store.getState().gold).toBe(0);
    });
  });

  describe('inventory management', () => {
    it('should add new items to inventory', () => {
      const store = playerManager.getStore();
      
      const item = {
        id: 'sword-1',
        name: 'Iron Sword',
        type: 'weapon' as const,
        quantity: 1,
        description: 'A sturdy iron sword'
      };

      store.getState().addItem(item);

      const state = store.getState();
      expect(state.inventory).toHaveLength(1);
      expect(state.inventory[0]).toEqual(item);
    });

    it('should stack existing items by increasing quantity', () => {
      const store = playerManager.getStore();
      
      const item1 = {
        id: 'potion-health',
        name: 'Health Potion',
        type: 'consumable' as const,
        quantity: 3,
        description: 'Restores health'
      };

      const item2 = {
        id: 'potion-health',
        name: 'Health Potion',
        type: 'consumable' as const,
        quantity: 2,
        description: 'Restores health'
      };

      store.getState().addItem(item1);
      store.getState().addItem(item2);

      const state = store.getState();
      expect(state.inventory).toHaveLength(1);
      expect(state.inventory[0].quantity).toBe(5);
      expect(state.inventory[0].id).toBe('potion-health');
    });

    it('should remove items with exact quantity', () => {
      const store = playerManager.getStore();
      
      const item = {
        id: 'arrow',
        name: 'Arrows',
        type: 'misc' as const,
        quantity: 10,
        description: 'Sharp arrows'
      };

      store.getState().addItem(item);
      expect(store.getState().inventory).toHaveLength(1);

      const success = store.getState().removeItem('arrow', 10);
      expect(success).toBe(true);
      expect(store.getState().inventory).toHaveLength(0);
    });

    it('should reduce item quantity when removing partial amount', () => {
      const store = playerManager.getStore();
      
      const item = {
        id: 'arrow',
        name: 'Arrows',
        type: 'misc' as const,
        quantity: 10,
        description: 'Sharp arrows'
      };

      store.getState().addItem(item);
      
      const success = store.getState().removeItem('arrow', 3);
      expect(success).toBe(true);
      
      const state = store.getState();
      expect(state.inventory).toHaveLength(1);
      expect(state.inventory[0].quantity).toBe(7);
    });

    it('should default to removing 1 item when quantity not specified', () => {
      const store = playerManager.getStore();
      
      const item = {
        id: 'gem',
        name: 'Ruby',
        type: 'misc' as const,
        quantity: 5,
        description: 'A precious ruby'
      };

      store.getState().addItem(item);
      
      const success = store.getState().removeItem('gem');
      expect(success).toBe(true);
      
      const state = store.getState();
      expect(state.inventory[0].quantity).toBe(4);
    });

    it('should not remove items when insufficient quantity', () => {
      const store = playerManager.getStore();
      
      const item = {
        id: 'coin',
        name: 'Gold Coin',
        type: 'misc' as const,
        quantity: 3,
        description: 'A shiny gold coin'
      };

      store.getState().addItem(item);
      
      const success = store.getState().removeItem('coin', 5);
      expect(success).toBe(false);
      
      const state = store.getState();
      expect(state.inventory[0].quantity).toBe(3); // unchanged
    });

    it('should not remove non-existent items', () => {
      const store = playerManager.getStore();
      
      const success = store.getState().removeItem('non-existent');
      expect(success).toBe(false);
      expect(store.getState().inventory).toHaveLength(0);
    });
  });

  describe('spell management', () => {
    it('should learn new spells', () => {
      const store = playerManager.getStore();
      
      expect(store.getState().knownSpells).toEqual(['fire-bolt', 'ice-shard', 'shield-aura']);
      
      store.getState().learnSpell('lightning-bolt');
      
      expect(store.getState().knownSpells).toEqual(['fire-bolt', 'ice-shard', 'shield-aura', 'lightning-bolt']);
    });

    it('should not duplicate spells', () => {
      const store = playerManager.getStore();
      
      expect(store.getState().knownSpells).toEqual(['fire-bolt', 'ice-shard', 'shield-aura']);
      
      store.getState().learnSpell('fire-bolt'); // already known
      
      expect(store.getState().knownSpells).toEqual(['fire-bolt', 'ice-shard', 'shield-aura']); // unchanged
    });
  });

  describe('position management', () => {
    it('should update player position', () => {
      const store = playerManager.getStore();
      
      expect(store.getState().position).toEqual({ x: 0, y: 0 });
      
      store.getState().updatePosition({ x: 150, y: 250 });
      
      expect(store.getState().position).toEqual({ x: 150, y: 250 });
    });
  });

  describe('computed values', () => {
    it('should calculate experience progress correctly', () => {
      const store = playerManager.getStore();
      
      // Level 1: requires 100 XP
      expect(store.getState().experienceProgress).toBe(0); // 0 / 100
      
      // Add some experience
      store.setState({ experience: 50 });
      expect(store.getState().experienceProgress).toBe(0.5); // 50 / 100
      
      // Level up to 2: requires 400 XP total
      store.setState({ level: 2, experience: 200 });
      expect(store.getState().experienceProgress).toBe(0.5); // 200 / 400
    });

    it('should determine when player can level up', () => {
      const store = playerManager.getStore();
      
      expect(store.getState().canLevelUp).toBe(false);
      
      // Add enough XP for level 1 (100 XP required)
      store.setState({ experience: 100 });
      expect(store.getState().canLevelUp).toBe(true);
      
      // Level up and check level 2 (400 XP required total)
      store.setState({ level: 2, experience: 300 });
      expect(store.getState().canLevelUp).toBe(false);
      
      store.setState({ experience: 400 });
      expect(store.getState().canLevelUp).toBe(true);
    });
  });

  describe('domain model synchronization', () => {
    it('should sync from domain player model', () => {
      const store = playerManager.getStore();
      
      const domainPlayer = new Player(
        'player-123',
        { x: 200, y: 300 },
        {
          hp: 80,
          maxHp: 120,
          mana: 40,
          maxMana: 60,
          attack: 18,
          defense: 12,
          castSpeed: 1.3
        },
        3,
        500,
        350,
        ['fire-bolt', 'ice-shard', 'shield-aura', 'heal']
      );

      playerManager.syncFromDomainPlayer(domainPlayer);

      const state = store.getState();
      expect(state.stats.hp).toBe(80);
      expect(state.stats.maxHp).toBe(120);
      expect(state.stats.mana).toBe(40);
      expect(state.stats.maxMana).toBe(60);
      expect(state.stats.attack).toBe(18);
      expect(state.stats.defense).toBe(12);
      expect(state.stats.castSpeed).toBe(1.3);
      expect(state.level).toBe(3);
      expect(state.experience).toBe(500);
      expect(state.gold).toBe(350);
      expect(state.knownSpells).toEqual(['fire-bolt', 'ice-shard', 'shield-aura', 'heal']);
      expect(state.position).toEqual({ x: 200, y: 300 });
    });

    it('should convert to domain player model', () => {
      const store = playerManager.getStore();
      
      // Set up some state
      store.getState().updateStats({ hp: 90, attack: 15 });
      store.getState().updatePosition({ x: 100, y: 150 });
      store.getState().addGold(50); // total 150
      store.getState().learnSpell('lightning-bolt');
      store.setState({ level: 2, experience: 200 });

      const domainPlayer = playerManager.toDomainPlayer('player-456');

      expect(domainPlayer.id).toBe('player-456');
      expect(domainPlayer.position).toEqual({ x: 100, y: 150 });
      expect(domainPlayer.stats.hp).toBe(90);
      expect(domainPlayer.stats.attack).toBe(15);
      expect(domainPlayer.level).toBe(2);
      expect(domainPlayer.experience).toBe(200);
      expect(domainPlayer.gold).toBe(150);
      expect(Array.from(domainPlayer.knownSpells)).toEqual(['fire-bolt', 'ice-shard', 'shield-aura', 'lightning-bolt']);
    });
  });
});