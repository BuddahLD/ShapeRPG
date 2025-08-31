/**
 * Presentation Manager: UI Layout Management
 * Manages relative positioning and responsive layout
 */

import { create } from 'zustand';

export interface UIPosition {
  readonly top?: string;
  readonly bottom?: string;
  readonly left?: string;
  readonly right?: string;
  readonly transform?: string;
}

export interface UIDimensions {
  readonly width: string;
  readonly height: string;
  readonly maxWidth?: string;
  readonly maxHeight?: string;
}

export interface UILayoutConfig {
  readonly position: UIPosition;
  readonly dimensions: UIDimensions;
  readonly zIndex: number;
  readonly isVisible: boolean;
}

// Pre-defined layout configurations for relative positioning
export const LAYOUT_CONFIGS = {
  // HUD elements
  healthBar: {
    position: { top: '1rem', left: '1rem' },
    dimensions: { width: '200px', height: '24px' },
    zIndex: 100,
    isVisible: true
  } as UILayoutConfig,

  manaBar: {
    position: { top: '2.5rem', left: '1rem' },
    dimensions: { width: '200px', height: '24px' },
    zIndex: 100,
    isVisible: true
  } as UILayoutConfig,

  hpmpContainer: {
    position: { top: '1rem', left: '1rem' },
    dimensions: { width: '200px', height: 'auto' },
    zIndex: 100,
    isVisible: true
  } as UILayoutConfig,

  locationIndicator: {
    position: { top: '1rem', left: '50%', transform: 'translateX(-50%)' },
    dimensions: { width: 'auto', height: '32px' },
    zIndex: 110,
    isVisible: true
  } as UILayoutConfig,

  virtualJoystick: {
    position: { bottom: '140px', left: '50%', transform: 'translateX(-50%)' },
    dimensions: { width: '120px', height: '120px' },
    zIndex: 90,
    isVisible: true
  } as UILayoutConfig,

  actionButtons: {
    position: { bottom: '180px', right: '2rem' },
    dimensions: { width: '40px', height: '40px' },
    zIndex: 90,
    isVisible: true
  } as UILayoutConfig,

  bottomBar: {
    position: { bottom: '2rem', left: '2rem', right: '2rem' },
    dimensions: { width: 'calc(100% - 4rem)', height: '60px' },
    zIndex: 95,
    isVisible: true
  } as UILayoutConfig,

  minimap: {
    position: { top: '1rem', right: '1rem' },
    dimensions: { width: '150px', height: '150px' },
    zIndex: 100,
    isVisible: true
  } as UILayoutConfig,

  // Modal and overlay elements
  characterModal: {
    position: { bottom: '60px', left: '50%', transform: 'translateX(-50%)' },
    dimensions: { width: '90vw', height: '500px', maxWidth: '500px' },
    zIndex: 200,
    isVisible: false
  } as UILayoutConfig,

  runeDrawingOverlay: {
    position: { top: '0', left: '0', right: '0', bottom: '0' },
    dimensions: { width: '100%', height: '100%' },
    zIndex: 150,
    isVisible: false
  } as UILayoutConfig,

  // Game canvas
  gameCanvas: {
    position: { top: '0', left: '0' },
    dimensions: { width: '100vw', height: '100vh' },
    zIndex: 1,
    isVisible: true
  } as UILayoutConfig
} as const;

interface UILayoutStore {
  // State
  layouts: Record<string, UILayoutConfig>;
  screenDimensions: { width: number; height: number };
  scaleFactor: number;
  
  // Actions
  updateLayout: (elementId: string, config: Partial<UILayoutConfig>) => void;
  setElementVisibility: (elementId: string, isVisible: boolean) => void;
  updateScreenDimensions: (width: number, height: number) => void;
  getLayoutStyles: (elementId: string) => React.CSSProperties;
  resetLayouts: () => void;
  
  // Responsive helpers
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export class UILayoutManager {
  private store: any;

  constructor() {
    this.createStore();
    this.setupResizeListener();
  }

  // Static instance for immediate access
  private static instance: UILayoutManager | null = null;

  static getInstance(): UILayoutManager {
    if (!UILayoutManager.instance) {
      UILayoutManager.instance = new UILayoutManager();
    }
    return UILayoutManager.instance;
  }

  private createStore() {
    this.store = create<UILayoutStore>((set, get) => ({
      // Initial state
      layouts: { ...LAYOUT_CONFIGS },
      screenDimensions: { 
        width: typeof window !== 'undefined' ? window.innerWidth : 390,
        height: typeof window !== 'undefined' ? window.innerHeight : 844
      },
      scaleFactor: 1,

      // Actions
      updateLayout: (elementId: string, config: Partial<UILayoutConfig>) => {
        set(state => ({
          layouts: {
            ...state.layouts,
            [elementId]: {
              ...state.layouts[elementId],
              ...config
            }
          }
        }));
      },

      setElementVisibility: (elementId: string, isVisible: boolean) => {
        set(state => ({
          layouts: {
            ...state.layouts,
            [elementId]: {
              ...state.layouts[elementId],
              isVisible
            }
          }
        }));
      },

      updateScreenDimensions: (width: number, height: number) => {
        const scaleFactor = Math.min(width / 390, height / 844); // Base iPhone dimensions
        set({ 
          screenDimensions: { width, height },
          scaleFactor: Math.max(0.5, Math.min(2, scaleFactor)) // Clamp scale factor
        });
      },

      getLayoutStyles: (elementId: string): React.CSSProperties => {
        const state = get();
        const layout = state.layouts[elementId];
        
        if (!layout) return {};

        return {
          position: 'absolute',
          top: layout.position.top,
          bottom: layout.position.bottom,
          left: layout.position.left,
          right: layout.position.right,
          transform: layout.position.transform,
          width: layout.dimensions.width,
          height: layout.dimensions.height,
          maxWidth: layout.dimensions.maxWidth,
          maxHeight: layout.dimensions.maxHeight,
          zIndex: layout.zIndex,
          display: layout.isVisible ? 'block' : 'none',
          // Apply scale factor to fixed sizes only
          fontSize: `${state.scaleFactor}rem`,
        };
      },

      resetLayouts: () => {
        set({ layouts: { ...LAYOUT_CONFIGS } });
      },

      // Computed responsive values
      get isMobile() {
        return get().screenDimensions.width < 768;
      },

      get isTablet() {
        const width = get().screenDimensions.width;
        return width >= 768 && width < 1024;
      },

      get isDesktop() {
        return get().screenDimensions.width >= 1024;
      }
    }));
  }

  private setupResizeListener() {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        this.store.getState().updateScreenDimensions(
          window.innerWidth,
          window.innerHeight
        );
      };

      window.addEventListener('resize', handleResize);
      
      // Initial setup
      handleResize();
      
      // Cleanup would be handled by component unmount
      return () => window.removeEventListener('resize', handleResize);
    }
  }

  getStore() {
    return this.store;
  }

  // Helper methods for common layout operations
  showModal(modalId: string) {
    this.store.getState().setElementVisibility(modalId, true);
  }

  hideModal(modalId: string) {
    this.store.getState().setElementVisibility(modalId, false);
  }

  updateElementPosition(elementId: string, position: UIPosition) {
    this.store.getState().updateLayout(elementId, { position });
  }

  // Responsive layout helpers
  getResponsiveWidth(baseWidth: number): string {
    const { isMobile, isTablet } = this.store.getState();
    
    if (isMobile) return `${Math.min(baseWidth, 90)}vw`;
    if (isTablet) return `${Math.min(baseWidth, 70)}vw`;
    return `${baseWidth}px`;
  }

  getResponsiveHeight(baseHeight: number): string {
    const { isMobile } = this.store.getState();
    return isMobile ? `${Math.min(baseHeight, 80)}vh` : `${baseHeight}px`;
  }
}