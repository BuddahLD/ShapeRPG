/**
 * Animation Manager - Observes state changes and manages UI animations
 * Follows SOLID principles - extends functionality without modifying existing logic
 */

export interface AnimationTarget {
  id: string;
  duration: number; // Total animation duration in ms
  phases: AnimationPhase[];
}

export interface AnimationPhase {
  name: string;
  startAt: number; // When this phase starts (ms from animation start)
  endAt: number; // When this phase ends (ms from animation start)
  styles: Record<string, string | number>;
}

export interface ActiveAnimation {
  target: AnimationTarget;
  startTime: number;
  currentPhase: string;
  isActive: boolean;
}

export class AnimationManager {
  private animations = new Map<string, ActiveAnimation>();
  private targets = new Map<string, AnimationTarget>();
  private listeners = new Map<string, (styles: Record<string, string | number>) => void>();

  /**
   * Register an animation target
   */
  registerTarget(target: AnimationTarget) {
    this.targets.set(target.id, target);
  }

  /**
   * Start an animation manually
   */
  startAnimation(targetId: string) {
    const target = this.targets.get(targetId);
    if (!target) return;

    // Clear any existing animation for this target
    this.animations.delete(targetId);

    const animation: ActiveAnimation = {
      target,
      startTime: Date.now(),
      currentPhase: target.phases[0]?.name || '',
      isActive: true
    };
    
    this.animations.set(targetId, animation);
  }

  /**
   * Register a listener for animation style updates
   */
  onStyleUpdate(targetId: string, listener: (styles: Record<string, string | number>) => void) {
    this.listeners.set(targetId, listener);
  }

  /**
   * Update active animations
   */
  update() {
    const now = Date.now();
    
    this.animations.forEach((animation, id) => {
      if (!animation.isActive) return;

      const elapsed = now - animation.startTime;
      
      // Check if animation is complete
      if (elapsed >= animation.target.duration) {
        this.endAnimation(id);
        return;
      }

      // Find current phase and apply styles
      const currentPhase = this.getCurrentPhase(animation.target, elapsed);
      if (currentPhase) {
        const listener = this.listeners.get(id);
        if (listener) {
          listener(currentPhase.styles);
        }
      }
    });
  }

  /**
   * End an animation
   */
  private endAnimation(id: string) {
    this.animations.delete(id);
    // Send empty styles to indicate animation is done
    const listener = this.listeners.get(id);
    if (listener) {
      listener({});
    }
  }

  /**
   * Get current animation phase
   */
  private getCurrentPhase(target: AnimationTarget, elapsed: number): AnimationPhase | null {
    return target.phases.find(phase => elapsed >= phase.startAt && elapsed <= phase.endAt) || null;
  }

  /**
   * Check if animation is running
   */
  isAnimating(targetId: string): boolean {
    return this.animations.has(targetId);
  }

  /**
   * Clear all animations
   */
  clear() {
    this.animations.clear();
    this.targets.clear();
    this.listeners.clear();
  }
}

// Global animation manager instance
export const animationManager = new AnimationManager();