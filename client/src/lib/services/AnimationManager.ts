/**
 * Animation Manager - Observes state changes and manages UI animations
 * Follows SOLID principles - extends functionality without modifying existing logic
 */

export interface AnimationTarget {
  id: string;
  trigger: () => boolean; // Function that determines if animation should start
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
   * Register a listener for animation style updates
   */
  onStyleUpdate(targetId: string, listener: (styles: Record<string, string | number>) => void) {
    this.listeners.set(targetId, listener);
  }

  /**
   * Check all targets and start animations if conditions are met
   */
  checkTriggers() {
    this.targets.forEach((target, id) => {
      if (!this.animations.has(id) && target.trigger()) {
        this.startAnimation(target);
      }
    });
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
        const interpolatedStyles = this.interpolateStyles(animation.target, elapsed);
        const listener = this.listeners.get(id);
        if (listener) {
          listener(interpolatedStyles);
        }
      }
    });
  }

  /**
   * Start an animation
   */
  private startAnimation(target: AnimationTarget) {
    const animation: ActiveAnimation = {
      target,
      startTime: Date.now(),
      currentPhase: target.phases[0]?.name || '',
      isActive: true
    };
    
    this.animations.set(target.id, animation);
  }

  /**
   * End an animation
   */
  private endAnimation(id: string) {
    this.animations.delete(id);
  }

  /**
   * Get current animation phase
   */
  private getCurrentPhase(target: AnimationTarget, elapsed: number): AnimationPhase | null {
    return target.phases.find(phase => elapsed >= phase.startAt && elapsed <= phase.endAt) || null;
  }

  /**
   * Interpolate styles between phases
   */
  private interpolateStyles(target: AnimationTarget, elapsed: number): Record<string, string | number> {
    const currentPhase = this.getCurrentPhase(target, elapsed);
    if (!currentPhase) return {};

    // For now, return the phase styles directly
    // Could add interpolation between phases here
    return currentPhase.styles;
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