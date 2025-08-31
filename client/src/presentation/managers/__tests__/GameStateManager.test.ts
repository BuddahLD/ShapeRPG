/**
 * Unit Tests: GameStateManager
 * Tests the presentation layer manager for game state operations
 */

import { GameStateManager } from '../GameStateManager';
import { GameStateService } from '../../../application/services/GameStateService';
import { AnimationService } from '../../../application/services/AnimationService';
import { Player } from '../../../domain/entities/Player';
import { WorldArea } from '../../../domain/valueObjects/WorldArea';

// Mock dependencies
jest.mock('../../../application/services/GameStateService');
jest.mock('../../../application/services/AnimationService');

describe('GameStateManager', () => {
  let gameStateManager: GameStateManager;
  let mockGameStateService: jest.Mocked<GameStateService>;
  let mockAnimationService: jest.Mocked<AnimationService>;

  beforeEach(() => {
    // Create mocks
    mockGameStateService = {
      initializeGame: jest.fn(),
      updateGameState: jest.fn(),
      setDrawingRune: jest.fn(),
      getCurrentGameState: jest.fn()
    } as any;

    mockAnimationService = {
      start: jest.fn(),
      stop: jest.fn(),
      update: jest.fn()
    } as any;

    // Create manager instance
    gameStateManager = new GameStateManager(mockGameStateService, mockAnimationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create manager with initial state', () => {
      const store = gameStateManager.getStore();
      const state = store.getState();

      expect(state.gameState.player).toBeNull();
      expect(state.gameState.currentArea).toBeNull();
      expect(state.gameState.isInCombat).toBe(false);
      expect(state.gameState.isDrawingRune).toBe(false);
      expect(state.gameState.gamePhase).toBe('loading');
      expect(state.gameState.isLoading).toBe(false);
      expect(state.gameState.error).toBeNull();
    });

    it('should provide backward compatibility getters', () => {
      const store = gameStateManager.getStore();
      const state = store.getState();

      expect(state.currentLocation).toBe('LOC_HUB_FIGUREIUM');
      expect(state.isDrawingRune).toBe(false);
    });
  });

  describe('game initialization', () => {
    it('should initialize game successfully', async () => {
      const mockPlayer = new Player('player1', { x: 0, y: 0 }, {
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        attack: 10,
        defense: 5,
        castSpeed: 1.0
      }, 1, 0, 100, ['fire-bolt']);

      const mockArea = new WorldArea('LOC_HUB_FIGUREIUM', 'Hub', { minX: -200, maxX: 200, minY: -100, maxY: 100 });

      const mockGameState = {
        player: mockPlayer,
        currentArea: mockArea,
        isInCombat: false,
        isDrawingRune: false,
        gamePhase: 'exploration' as const
      };

      mockGameStateService.initializeGame.mockResolvedValue({
        success: true,
        gameState: mockGameState
      });

      const store = gameStateManager.getStore();
      await store.getState().initializeGame('player1');

      expect(mockGameStateService.initializeGame).toHaveBeenCalledWith({ playerId: 'player1' });
      
      const state = store.getState();
      expect(state.gameState.player).not.toBeNull();
      expect(state.gameState.player!.id).toBe('player1');
      expect(state.gameState.currentArea).not.toBeNull();
      expect(state.gameState.currentArea!.id).toBe('LOC_HUB_FIGUREIUM');
      expect(state.gameState.isLoading).toBe(false);
      expect(state.gameState.error).toBeNull();
    });

    it('should handle initialization failure', async () => {
      mockGameStateService.initializeGame.mockResolvedValue({
        success: false,
        gameState: null as any
      });

      const store = gameStateManager.getStore();
      await store.getState().initializeGame('player1');

      const state = store.getState();
      expect(state.gameState.isLoading).toBe(false);
      expect(state.gameState.error).toBe('Failed to initialize game');
    });

    it('should handle initialization error', async () => {
      const errorMessage = 'Network error';
      mockGameStateService.initializeGame.mockRejectedValue(new Error(errorMessage));

      const store = gameStateManager.getStore();
      await store.getState().initializeGame('player1');

      const state = store.getState();
      expect(state.gameState.isLoading).toBe(false);
      expect(state.gameState.error).toBe(errorMessage);
    });
  });

  describe('game state updates', () => {
    it('should update game state successfully', async () => {
      const mockPlayer = new Player('player1', { x: 10, y: 20 }, {
        hp: 90,
        maxHp: 100,
        mana: 40,
        maxMana: 50,
        attack: 10,
        defense: 5,
        castSpeed: 1.0
      }, 1, 25, 95, ['fire-bolt']);

      const mockArea = new WorldArea('LOC_HUB_FIGUREIUM', 'Hub', { minX: -200, maxX: 200, minY: -100, maxY: 100 });

      const mockGameState = {
        player: mockPlayer,
        currentArea: mockArea,
        isInCombat: false,
        isDrawingRune: false,
        gamePhase: 'exploration' as const
      };

      // First initialize the game
      mockGameStateService.initializeGame.mockResolvedValue({
        success: true,
        gameState: mockGameState
      });

      const store = gameStateManager.getStore();
      await store.getState().initializeGame('player1');

      // Then update
      mockGameStateService.updateGameState.mockResolvedValue({
        success: true,
        gameState: mockGameState
      });

      await store.getState().updateGameState(16.67);

      expect(mockGameStateService.updateGameState).toHaveBeenCalledWith({
        playerId: 'player1',
        deltaTime: 16.67
      });

      const state = store.getState();
      expect(state.gameState.player!.position.x).toBe(10);
      expect(state.gameState.player!.position.y).toBe(20);
      expect(state.gameState.player!.stats.hp).toBe(90);
      expect(state.gameState.player!.experience).toBe(25);
    });

    it('should skip update when no player exists', async () => {
      const store = gameStateManager.getStore();
      await store.getState().updateGameState(16.67);

      expect(mockGameStateService.updateGameState).not.toHaveBeenCalled();
    });

    it('should handle update errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Initialize first
      const mockPlayer = new Player('player1', { x: 0, y: 0 }, {
        hp: 100, maxHp: 100, mana: 50, maxMana: 50, attack: 10, defense: 5, castSpeed: 1.0
      }, 1, 0, 100, []);

      mockGameStateService.initializeGame.mockResolvedValue({
        success: true,
        gameState: { player: mockPlayer, currentArea: null, isInCombat: false, isDrawingRune: false, gamePhase: 'exploration' as const }
      });

      const store = gameStateManager.getStore();
      await store.getState().initializeGame('player1');

      // Then make update fail
      mockGameStateService.updateGameState.mockRejectedValue(new Error('Update failed'));

      await store.getState().updateGameState(16.67);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to update game state:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('rune drawing management', () => {
    it('should set drawing rune state', () => {
      const mockGameState = {
        player: null,
        currentArea: null,
        isInCombat: false,
        isDrawingRune: true,
        gamePhase: 'rune-drawing' as const
      };

      mockGameStateService.setDrawingRune.mockImplementation();
      mockGameStateService.getCurrentGameState.mockReturnValue(mockGameState);

      const store = gameStateManager.getStore();
      store.getState().setDrawingRune(true);

      expect(mockGameStateService.setDrawingRune).toHaveBeenCalledWith(true);
      
      const state = store.getState();
      expect(state.gameState.isDrawingRune).toBe(true);
      expect(state.isDrawingRune).toBe(true);
    });
  });

  describe('error management', () => {
    it('should clear errors', () => {
      const store = gameStateManager.getStore();
      
      // Set an error first
      store.setState({
        gameState: {
          ...store.getState().gameState,
          error: 'Test error'
        }
      });

      expect(store.getState().gameState.error).toBe('Test error');

      // Clear the error
      store.getState().clearError();

      expect(store.getState().gameState.error).toBeNull();
    });
  });

  describe('adapter methods', () => {
    it('should adapt Player domain model to UI model', () => {
      const domainPlayer = new Player('player1', { x: 50, y: 75 }, {
        hp: 85,
        maxHp: 100,
        mana: 30,
        maxMana: 50,
        attack: 15,
        defense: 8,
        castSpeed: 1.2
      }, 2, 150, 250, ['fire-bolt', 'ice-shard']);

      const mockGameState = {
        player: domainPlayer,
        currentArea: null,
        isInCombat: false,
        isDrawingRune: false,
        gamePhase: 'exploration' as const
      };

      mockGameStateService.initializeGame.mockResolvedValue({
        success: true,
        gameState: mockGameState
      });

      const store = gameStateManager.getStore();
      
      // Use the private method through public interface
      return store.getState().initializeGame('player1').then(() => {
        const state = store.getState();
        const uiPlayer = state.gameState.player!;

        expect(uiPlayer.id).toBe('player1');
        expect(uiPlayer.position.x).toBe(50);
        expect(uiPlayer.position.y).toBe(75);
        expect(uiPlayer.stats.hp).toBe(85);
        expect(uiPlayer.stats.maxHp).toBe(100);
        expect(uiPlayer.stats.mana).toBe(30);
        expect(uiPlayer.stats.maxMana).toBe(50);
        expect(uiPlayer.stats.attack).toBe(15);
        expect(uiPlayer.stats.defense).toBe(8);
        expect(uiPlayer.stats.castSpeed).toBe(1.2);
        expect(uiPlayer.level).toBe(2);
        expect(uiPlayer.experience).toBe(150);
        expect(uiPlayer.gold).toBe(250);
        expect(uiPlayer.knownSpells).toEqual(['fire-bolt', 'ice-shard']);
      });
    });

    it('should adapt WorldArea domain model to UI model', () => {
      const domainArea = new WorldArea('LOC_ARENA_1', 'Arena', 
        { minX: 600, maxX: 1000, minY: -50, maxY: 50 },
        'combat',
        { primary: '#dc2626', secondary: '#991b1b', accent: '#fca5a5', background: '#7f1d1d' },
        'linear-gradient(135deg, #dc2626, #991b1b)'
      );

      const mockGameState = {
        player: null,
        currentArea: domainArea,
        isInCombat: true,
        isDrawingRune: false,
        gamePhase: 'combat' as const
      };

      mockGameStateService.initializeGame.mockResolvedValue({
        success: true,
        gameState: mockGameState
      });

      const store = gameStateManager.getStore();
      
      return store.getState().initializeGame('player1').then(() => {
        const state = store.getState();
        const uiArea = state.gameState.currentArea!;

        expect(uiArea.id).toBe('LOC_ARENA_1');
        expect(uiArea.name).toBe('Arena');
        expect(uiArea.bounds.minX).toBe(600);
        expect(uiArea.bounds.maxX).toBe(1000);
        expect(uiArea.gamePhase).toBe('combat');
        expect(uiArea.visualTheme.primary).toBe('#dc2626');
        expect(uiArea.backgroundGradient).toBe('linear-gradient(135deg, #dc2626, #991b1b)');
        expect(state.currentLocation).toBe('LOC_ARENA_1');
      });
    });
  });
});