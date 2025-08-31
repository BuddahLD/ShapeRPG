/**
 * Unit Tests: UILayoutManager
 * Tests the presentation layer manager for UI layout and positioning
 */

import { UILayoutManager, LAYOUT_CONFIGS } from '../UILayoutManager';

// Mock window object for testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 390,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 844,
});

// Mock addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockRemoveEventListener,
});

describe('UILayoutManager', () => {
  let uiLayoutManager: UILayoutManager;

  beforeEach(() => {
    jest.clearAllMocks();
    uiLayoutManager = new UILayoutManager();
  });

  describe('initialization', () => {
    it('should create manager with default layout configurations', () => {
      const store = uiLayoutManager.getStore();
      const state = store.getState();

      expect(state.layouts).toEqual(LAYOUT_CONFIGS);
      expect(state.screenDimensions.width).toBe(390);
      expect(state.screenDimensions.height).toBe(844);
      expect(state.scaleFactor).toBe(1);
    });

    it('should set up resize listener', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should provide responsive breakpoint getters', () => {
      const store = uiLayoutManager.getStore();
      const state = store.getState();

      expect(state.isMobile).toBe(true); // 390 < 768
      expect(state.isTablet).toBe(false);
      expect(state.isDesktop).toBe(false);
    });
  });

  describe('layout configurations', () => {
    it('should contain all required layout elements', () => {
      const expectedElements = [
        'healthBar',
        'manaBar',
        'locationIndicator',
        'virtualJoystick',
        'actionButtons',
        'bottomBar',
        'minimap',
        'characterModal',
        'runeDrawingOverlay',
        'gameCanvas'
      ];

      expectedElements.forEach(element => {
        expect(LAYOUT_CONFIGS[element]).toBeDefined();
        expect(LAYOUT_CONFIGS[element].position).toBeDefined();
        expect(LAYOUT_CONFIGS[element].dimensions).toBeDefined();
        expect(LAYOUT_CONFIGS[element].zIndex).toBeGreaterThanOrEqual(1);
        expect(typeof LAYOUT_CONFIGS[element].isVisible).toBe('boolean');
      });
    });

    it('should have proper z-index hierarchy', () => {
      // Game canvas should be at the bottom
      expect(LAYOUT_CONFIGS.gameCanvas.zIndex).toBe(1);
      
      // HUD elements should be above game
      expect(LAYOUT_CONFIGS.healthBar.zIndex).toBeGreaterThan(LAYOUT_CONFIGS.gameCanvas.zIndex);
      expect(LAYOUT_CONFIGS.minimap.zIndex).toBeGreaterThan(LAYOUT_CONFIGS.gameCanvas.zIndex);
      
      // Overlays should be at the top
      expect(LAYOUT_CONFIGS.runeDrawingOverlay.zIndex).toBeGreaterThan(LAYOUT_CONFIGS.healthBar.zIndex);
      expect(LAYOUT_CONFIGS.characterModal.zIndex).toBeGreaterThan(LAYOUT_CONFIGS.runeDrawingOverlay.zIndex);
    });

    it('should have relative positioning for all elements', () => {
      Object.values(LAYOUT_CONFIGS).forEach(config => {
        const hasRelativePosition = 
          config.position.top || 
          config.position.bottom || 
          config.position.left || 
          config.position.right ||
          config.position.transform;
        
        expect(hasRelativePosition).toBeTruthy();
      });
    });
  });

  describe('layout updates', () => {
    it('should update individual layout elements', () => {
      const store = uiLayoutManager.getStore();
      
      const newConfig = {
        position: { top: '2rem', right: '2rem' },
        dimensions: { width: '200px', height: '100px' },
        zIndex: 150,
        isVisible: false
      };

      store.getState().updateLayout('healthBar', newConfig);

      const state = store.getState();
      expect(state.layouts.healthBar.position.top).toBe('2rem');
      expect(state.layouts.healthBar.position.right).toBe('2rem');
      expect(state.layouts.healthBar.dimensions.width).toBe('200px');
      expect(state.layouts.healthBar.dimensions.height).toBe('100px');
      expect(state.layouts.healthBar.zIndex).toBe(150);
      expect(state.layouts.healthBar.isVisible).toBe(false);
    });

    it('should update partial layout configuration', () => {
      const store = uiLayoutManager.getStore();
      
      const originalConfig = { ...state.layouts.healthBar };
      
      store.getState().updateLayout('healthBar', {
        position: { bottom: '1rem' }
      });

      const state = store.getState();
      expect(state.layouts.healthBar.position.bottom).toBe('1rem');
      expect(state.layouts.healthBar.dimensions).toEqual(originalConfig.dimensions);
      expect(state.layouts.healthBar.zIndex).toBe(originalConfig.zIndex);
    });

    it('should set element visibility', () => {
      const store = uiLayoutManager.getStore();
      
      expect(store.getState().layouts.characterModal.isVisible).toBe(false);
      
      store.getState().setElementVisibility('characterModal', true);
      expect(store.getState().layouts.characterModal.isVisible).toBe(true);
      
      store.getState().setElementVisibility('characterModal', false);
      expect(store.getState().layouts.characterModal.isVisible).toBe(false);
    });

    it('should reset layouts to default', () => {
      const store = uiLayoutManager.getStore();
      
      // Modify a layout
      store.getState().updateLayout('healthBar', {
        position: { bottom: '5rem' },
        isVisible: false
      });

      // Verify modification
      expect(store.getState().layouts.healthBar.position.bottom).toBe('5rem');
      expect(store.getState().layouts.healthBar.isVisible).toBe(false);

      // Reset
      store.getState().resetLayouts();

      // Verify reset
      const state = store.getState();
      expect(state.layouts).toEqual(LAYOUT_CONFIGS);
      expect(state.layouts.healthBar.position.bottom).toBeUndefined();
      expect(state.layouts.healthBar.isVisible).toBe(true);
    });
  });

  describe('screen dimensions and scaling', () => {
    it('should update screen dimensions and calculate scale factor', () => {
      const store = uiLayoutManager.getStore();
      
      store.getState().updateScreenDimensions(780, 1200);

      const state = store.getState();
      expect(state.screenDimensions.width).toBe(780);
      expect(state.screenDimensions.height).toBe(1200);
      expect(state.scaleFactor).toBeCloseTo(1.42, 2); // Math.min(780/390, 1200/844)
    });

    it('should clamp scale factor between 0.5 and 2', () => {
      const store = uiLayoutManager.getStore();
      
      // Test minimum scale factor
      store.getState().updateScreenDimensions(100, 100);
      expect(store.getState().scaleFactor).toBe(0.5);

      // Test maximum scale factor
      store.getState().updateScreenDimensions(2000, 2000);
      expect(store.getState().scaleFactor).toBe(2);
    });

    it('should update responsive breakpoints', () => {
      const store = uiLayoutManager.getStore();
      
      // Mobile
      store.getState().updateScreenDimensions(400, 600);
      let state = store.getState();
      expect(state.isMobile).toBe(true);
      expect(state.isTablet).toBe(false);
      expect(state.isDesktop).toBe(false);

      // Tablet
      store.getState().updateScreenDimensions(800, 600);
      state = store.getState();
      expect(state.isMobile).toBe(false);
      expect(state.isTablet).toBe(true);
      expect(state.isDesktop).toBe(false);

      // Desktop
      store.getState().updateScreenDimensions(1200, 800);
      state = store.getState();
      expect(state.isMobile).toBe(false);
      expect(state.isTablet).toBe(false);
      expect(state.isDesktop).toBe(true);
    });
  });

  describe('layout styles generation', () => {
    it('should generate correct CSS styles for elements', () => {
      const store = uiLayoutManager.getStore();
      
      const styles = store.getState().getLayoutStyles('healthBar');

      expect(styles.position).toBe('absolute');
      expect(styles.top).toBe('2rem');
      expect(styles.left).toBe('1rem');
      expect(styles.width).toBe('200px');
      expect(styles.height).toBe('24px');
      expect(styles.zIndex).toBe(100);
      expect(styles.display).toBe('block');
      expect(styles.fontSize).toBe('1rem');
    });

    it('should apply scale factor to font size', () => {
      const store = uiLayoutManager.getStore();
      
      store.getState().updateScreenDimensions(780, 1200); // scale factor ~1.42
      
      const styles = store.getState().getLayoutStyles('healthBar');
      expect(styles.fontSize).toBeCloseTo('1.42rem');
    });

    it('should hide invisible elements', () => {
      const store = uiLayoutManager.getStore();
      
      store.getState().setElementVisibility('healthBar', false);
      
      const styles = store.getState().getLayoutStyles('healthBar');
      expect(styles.display).toBe('none');
    });

    it('should return empty styles for non-existent elements', () => {
      const store = uiLayoutManager.getStore();
      
      const styles = store.getState().getLayoutStyles('non-existent');
      expect(styles).toEqual({});
    });
  });

  describe('helper methods', () => {
    it('should show and hide modals', () => {
      const store = uiLayoutManager.getStore();
      
      expect(store.getState().layouts.characterModal.isVisible).toBe(false);
      
      uiLayoutManager.showModal('characterModal');
      expect(store.getState().layouts.characterModal.isVisible).toBe(true);
      
      uiLayoutManager.hideModal('characterModal');
      expect(store.getState().layouts.characterModal.isVisible).toBe(false);
    });

    it('should update element positions', () => {
      const store = uiLayoutManager.getStore();
      
      const newPosition = { top: '5rem', right: '3rem' };
      uiLayoutManager.updateElementPosition('actionButtons', newPosition);

      const state = store.getState();
      expect(state.layouts.actionButtons.position.top).toBe('5rem');
      expect(state.layouts.actionButtons.position.right).toBe('3rem');
    });

    it('should calculate responsive widths', () => {
      const store = uiLayoutManager.getStore();
      
      // Mobile (width < 768)
      store.getState().updateScreenDimensions(400, 600);
      expect(uiLayoutManager.getResponsiveWidth(500)).toBe('90vw');
      expect(uiLayoutManager.getResponsiveWidth(50)).toBe('50vw');

      // Tablet (768 <= width < 1024)
      store.getState().updateScreenDimensions(800, 600);
      expect(uiLayoutManager.getResponsiveWidth(500)).toBe('70vw');
      expect(uiLayoutManager.getResponsiveWidth(50)).toBe('50vw');

      // Desktop (width >= 1024)
      store.getState().updateScreenDimensions(1200, 800);
      expect(uiLayoutManager.getResponsiveWidth(500)).toBe('500px');
      expect(uiLayoutManager.getResponsiveWidth(50)).toBe('50px');
    });

    it('should calculate responsive heights', () => {
      const store = uiLayoutManager.getStore();
      
      // Mobile
      store.getState().updateScreenDimensions(400, 600);
      expect(uiLayoutManager.getResponsiveHeight(500)).toBe('80vh');
      expect(uiLayoutManager.getResponsiveHeight(50)).toBe('50vh');

      // Desktop
      store.getState().updateScreenDimensions(1200, 800);
      expect(uiLayoutManager.getResponsiveHeight(500)).toBe('500px');
      expect(uiLayoutManager.getResponsiveHeight(50)).toBe('50px');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined window dimensions gracefully', () => {
      // This test simulates server-side rendering where window is not available
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;

      // Temporarily delete window properties
      delete (window as any).innerWidth;
      delete (window as any).innerHeight;

      // Create new manager
      const ssrManager = new UILayoutManager();
      const store = ssrManager.getStore();
      const state = store.getState();

      // Should use default dimensions
      expect(state.screenDimensions.width).toBe(390);
      expect(state.screenDimensions.height).toBe(844);

      // Restore window properties
      window.innerWidth = originalInnerWidth;
      window.innerHeight = originalInnerHeight;
    });

    it('should handle extreme scale factors', () => {
      const store = uiLayoutManager.getStore();
      
      // Very small screen
      store.getState().updateScreenDimensions(50, 50);
      expect(store.getState().scaleFactor).toBe(0.5);

      // Very large screen
      store.getState().updateScreenDimensions(5000, 5000);
      expect(store.getState().scaleFactor).toBe(2);
    });

    it('should handle zero dimensions', () => {
      const store = uiLayoutManager.getStore();
      
      store.getState().updateScreenDimensions(0, 0);
      expect(store.getState().scaleFactor).toBe(0.5); // Clamped to minimum
    });
  });
});