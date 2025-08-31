/**
 * Presentation Hook: UI Layout Manager Integration
 * Provides React hooks for responsive layout management
 */

import { useEffect, useRef } from 'react';
import { UILayoutManager } from '../managers/UILayoutManager';

let layoutManagerInstance: UILayoutManager | null = null;

export function useUILayoutManager() {
  const managerRef = useRef<UILayoutManager | null>(null);

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new UILayoutManager();
      layoutManagerInstance = managerRef.current;
    }
  }, []);

  return managerRef.current;
}

// Hook for accessing layout store
export function useUILayout() {
  const manager = useUILayoutManager();
  return manager?.getStore();
}

// Hook for getting element styles with relative positioning
export function useElementLayout(elementId: string) {
  const manager = useUILayoutManager();
  const store = manager?.getStore();
  
  if (!store) {
    return {
      styles: {},
      isVisible: true,
      updatePosition: () => {},
      setVisibility: () => {}
    };
  }

  const state = store.getState();
  
  return {
    styles: state.getLayoutStyles(elementId),
    isVisible: state.layouts[elementId]?.isVisible ?? true,
    updatePosition: (position: any) => state.updateLayout(elementId, { position }),
    setVisibility: (isVisible: boolean) => state.setElementVisibility(elementId, isVisible)
  };
}

// Hook for responsive values
export function useResponsive() {
  const store = useUILayout();
  
  if (!store) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenDimensions: { width: 1024, height: 768 },
      scaleFactor: 1
    };
  }

  const state = store.getState();
  
  return {
    isMobile: state.isMobile,
    isTablet: state.isTablet,
    isDesktop: state.isDesktop,
    screenDimensions: state.screenDimensions,
    scaleFactor: state.scaleFactor
  };
}