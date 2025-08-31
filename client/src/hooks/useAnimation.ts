import { useEffect, useState, useRef } from 'react';
import { animationManager, AnimationTarget } from '../lib/services/AnimationManager';

/**
 * Hook for using the Animation Manager
 * Provides manual control over animations without complex trigger logic
 */
export function useAnimation(target: AnimationTarget) {
  const [styles, setStyles] = useState<Record<string, string | number>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const updateIntervalRef = useRef<number>();

  useEffect(() => {
    // Register the animation target
    animationManager.registerTarget(target);

    // Listen for style updates
    animationManager.onStyleUpdate(target.id, (newStyles) => {
      setStyles(newStyles);
      setIsAnimating(Object.keys(newStyles).length > 0);
    });

    // Set up animation update loop
    updateIntervalRef.current = window.setInterval(() => {
      animationManager.update();
    }, 16); // ~60fps

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [target.id]);

  // Manual trigger function
  const startAnimation = () => {
    animationManager.startAnimation(target.id);
  };

  return { styles, isAnimating, startAnimation };
}