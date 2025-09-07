import { useEffect, useState, useRef } from 'react';
import { animationManager, AnimationTarget } from '../lib/services/AnimationManager';

/**
 * Hook for using the Animation Manager
 * Provides manual control over animations without complex trigger logic
 */
interface UseAnimationReturn {
  styles: Record<string, string | number>;
  isAnimating: boolean;
  startAnimation: () => void;
}

export function useAnimation(target: AnimationTarget): UseAnimationReturn {
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

    // Set up animation update loop - use requestAnimationFrame instead of setInterval
    const updateLoop = () => {
      animationManager.update();
      updateIntervalRef.current = requestAnimationFrame(updateLoop);
    };
    
    updateIntervalRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (updateIntervalRef.current) {
        cancelAnimationFrame(updateIntervalRef.current);
      }
    };
  }, [target.id]);

  // Manual trigger function
  const startAnimation = () => {
    animationManager.startAnimation(target.id);
  };

  return { styles, isAnimating, startAnimation };
}