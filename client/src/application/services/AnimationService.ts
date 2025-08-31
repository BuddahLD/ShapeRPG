/**
 * Application Service: Animation Coordination
 * Orchestrates UI animations and visual effects
 */

export interface AnimationTarget {
  readonly id: string;
  readonly duration: number;
  readonly phases: AnimationPhase[];
}

export interface AnimationPhase {
  readonly name: string;
  readonly startAt: number;
  readonly endAt: number;
  readonly styles: Record<string, string | number>;
}

export interface AnimationRequest {
  readonly targetId: string;
  readonly trigger: 'manual' | 'automatic' | 'state-change';
  readonly context?: Record<string, any>;
}

export interface AnimationResponse {
  readonly success: boolean;
  readonly animationId: string;
  readonly estimatedDuration: number;
}

export class AnimationService {
  private activeAnimations = new Map<string, {
    target: AnimationTarget;
    startTime: number;
    context?: Record<string, any>;
  }>();

  private animationTargets = new Map<string, AnimationTarget>();
  private styleListeners = new Map<string, (styles: Record<string, string | number>) => void>();

  registerAnimationTarget(target: AnimationTarget): void {
    this.animationTargets.set(target.id, target);
  }

  unregisterAnimationTarget(targetId: string): void {
    this.animationTargets.delete(targetId);
    this.stopAnimation(targetId);
  }

  startAnimation(request: AnimationRequest): AnimationResponse {
    const target = this.animationTargets.get(request.targetId);
    if (!target) {
      return {
        success: false,
        animationId: '',
        estimatedDuration: 0
      };
    }

    // Stop any existing animation for this target
    this.stopAnimation(request.targetId);

    // Start new animation
    const animationId = `${request.targetId}_${Date.now()}`;
    this.activeAnimations.set(request.targetId, {
      target,
      startTime: Date.now(),
      context: request.context
    });

    return {
      success: true,
      animationId,
      estimatedDuration: target.duration
    };
  }

  stopAnimation(targetId: string): void {
    this.activeAnimations.delete(targetId);
    
    // Reset styles to default
    const listener = this.styleListeners.get(targetId);
    if (listener) {
      listener({});
    }
  }

  onStyleUpdate(targetId: string, listener: (styles: Record<string, string | number>) => void): void {
    this.styleListeners.set(targetId, listener);
  }

  update(): void {
    const now = Date.now();

    this.activeAnimations.forEach((animation, targetId) => {
      const elapsed = now - animation.startTime;
      
      if (elapsed >= animation.target.duration) {
        // Animation completed
        this.stopAnimation(targetId);
        return;
      }

      // Find current phase
      const currentPhase = this.getCurrentPhase(animation.target, elapsed);
      if (currentPhase) {
        const listener = this.styleListeners.get(targetId);
        if (listener) {
          listener(currentPhase.styles);
        }
      }
    });
  }

  isAnimating(targetId: string): boolean {
    return this.activeAnimations.has(targetId);
  }

  getActiveAnimations(): string[] {
    return Array.from(this.activeAnimations.keys());
  }

  private getCurrentPhase(target: AnimationTarget, elapsed: number): AnimationPhase | null {
    return target.phases.find(phase => 
      elapsed >= phase.startAt && elapsed <= phase.endAt
    ) || null;
  }

  // Predefined animation factories
  createFadeInOutAnimation(id: string, duration: number = 2500): AnimationTarget {
    return {
      id,
      duration,
      phases: [
        {
          name: 'fadeIn',
          startAt: 0,
          endAt: duration * 0.2,
          styles: { opacity: 1, transform: 'scale(1)' }
        },
        {
          name: 'visible',
          startAt: duration * 0.2,
          endAt: duration * 0.8,
          styles: { opacity: 1, transform: 'scale(1)' }
        },
        {
          name: 'fadeOut',
          startAt: duration * 0.8,
          endAt: duration,
          styles: { opacity: 0, transform: 'scale(0.95)' }
        }
      ]
    };
  }

  createSlideAnimation(id: string, direction: 'left' | 'right' | 'up' | 'down', duration: number = 1000): AnimationTarget {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)', 
      up: 'translateY(-100%)',
      down: 'translateY(100%)'
    };

    return {
      id,
      duration,
      phases: [
        {
          name: 'slideIn',
          startAt: 0,
          endAt: duration * 0.5,
          styles: { transform: 'translate(0, 0)', opacity: 1 }
        },
        {
          name: 'slideOut',
          startAt: duration * 0.5,
          endAt: duration,
          styles: { transform: transforms[direction], opacity: 0 }
        }
      ]
    };
  }

  createPulseAnimation(id: string, intensity: number = 1.1, duration: number = 1000): AnimationTarget {
    return {
      id,
      duration,
      phases: [
        {
          name: 'expand',
          startAt: 0,
          endAt: duration * 0.5,
          styles: { transform: `scale(${intensity})`, opacity: 1 }
        },
        {
          name: 'contract',
          startAt: duration * 0.5,
          endAt: duration,
          styles: { transform: 'scale(1)', opacity: 1 }
        }
      ]
    };
  }
}