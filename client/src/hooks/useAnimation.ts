import { useEffect, useState } from 'react';
import { animationManager, AnimationTarget } from '../lib/services/AnimationManager';

/**
 * Hook for using the Animation Manager
 * Observes state and provides animation styles without affecting existing logic
 */
export function useAnimation(target: AnimationTarget) {
  const [styles, setStyles] = useState<Record<string, string | number>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Register the animation target
    animationManager.registerTarget(target);

    // Listen for style updates
    animationManager.onStyleUpdate(target.id, (newStyles) => {
      setStyles(newStyles);
      setIsAnimating(true);
    });

    // Set up animation loop
    const checkInterval = setInterval(() => {
      animationManager.checkTriggers();
      animationManager.update();
    }, 16); // ~60fps

    return () => {
      clearInterval(checkInterval);
    };
  }, [target.id]);

  // Reset animation state when styles become empty
  useEffect(() => {
    if (Object.keys(styles).length === 0) {
      setIsAnimating(false);
    }
  }, [styles]);

  return { styles, isAnimating };
}