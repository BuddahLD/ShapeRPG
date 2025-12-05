/**
 * Application Service: Spell Casting Management
 * Single Responsibility: Orchestrate spell casting workflow
 * SOLID: Depends only on Domain layer, provides interface for Presentation layer
 */

import { SpellCastingRepository } from '../repositories/SpellCastingRepository';

// Define animation service interface to avoid circular dependency
export interface AnimationService {
  startCastingAnimation(spellId: string, castTime: number, callbacks: AnimationCallbacks): Promise<void>;
  stopCastingAnimation(): Promise<void>;
  dispose(): void;
}

export interface AnimationCallbacks {
  onComplete: () => void;
  onDirectionSet: (direction: { x: number; y: number }) => void;
}

export interface CastingState {
  isCasting: boolean;
  castSpellId: string | null;
  castDirection: { x: number; y: number } | null;
}

export interface CastingCallbacks {
  onCastingStart: (spellId: string) => void;
  onCastingComplete: (spellId: string) => void;
  onCastingCancel: () => void;
}

export class CastingService {
  private state: CastingState = {
    isCasting: false,
    castSpellId: null,
    castDirection: null
  };

  private callbacks: CastingCallbacks | null = null;
  private animationService: AnimationService | null = null;
  private castingTimeout: NodeJS.Timeout | null = null;

  constructor(
    private spellCastingRepository: SpellCastingRepository,
    animationService?: AnimationService
  ) {
    this.animationService = animationService || null;
  }

  /**
   * Start casting animation for a spell
   */
  async startCasting(spellId: string): Promise<void> {
    if (this.state.isCasting) {
      throw new Error('Already casting a spell');
    }

    // Validate spell exists
    const spell = await this.spellCastingRepository.getSpell(spellId);
    if (!spell) {
      throw new Error(`Spell ${spellId} not found`);
    }

    // Update state
    this.state = {
      isCasting: true,
      castSpellId: spellId,
      castDirection: null
    };

    // Start animation (CSS-based, so we just need to set a timeout)
    console.log('🎬 CastingService: Setting timeout for', spell.castTime, 'seconds');
    this.castingTimeout = setTimeout(() => {
      console.log('🎬 CastingService: Timeout reached, calling handleCastingComplete');
      this.handleCastingComplete();
    }, spell.castTime * 1000);

    // Notify callbacks
    console.log('🎬 CastingService: Calling onCastingStart callback');
    this.callbacks?.onCastingStart(spellId);
  }

  /**
   * Complete the casting process
   */
  private async handleCastingComplete(): Promise<void> {
    console.log('🎬 CastingService: handleCastingComplete called');
    if (!this.state.isCasting || !this.state.castSpellId) {
      console.log('🎬 CastingService: Not casting or no spell ID, returning');
      return;
    }

    const spellId = this.state.castSpellId;
    console.log('🎬 CastingService: Casting spell:', spellId);
    
    // Execute the spell
    await this.spellCastingRepository.castSpell(spellId, this.state.castDirection);

    // Reset state
    this.state = {
      isCasting: false,
      castSpellId: null,
      castDirection: null
    };

    console.log('🎬 CastingService: Calling onCastingComplete callback');
    // Notify callbacks
    this.callbacks?.onCastingComplete(spellId);
  }

  /**
   * Set casting direction
   */
  private handleDirectionSet(direction: { x: number; y: number }): void {
    this.state.castDirection = direction;
  }

  /**
   * Cancel current casting
   */
  async cancelCasting(): Promise<void> {
    if (!this.state.isCasting) {
      return;
    }

    // Clear the casting timeout
    if (this.castingTimeout) {
      clearTimeout(this.castingTimeout);
      this.castingTimeout = null;
    }
    
    this.state = {
      isCasting: false,
      castSpellId: null,
      castDirection: null
    };

    this.callbacks?.onCastingCancel();
  }

  /**
   * Get current casting state
   */
  getCastingState(): CastingState {
    return { ...this.state };
  }

  /**
   * Set callbacks for casting events
   */
  setCallbacks(callbacks: CastingCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.castingTimeout) {
      clearTimeout(this.castingTimeout);
      this.castingTimeout = null;
    }
    if (this.animationService) {
      this.animationService.dispose();
    }
    this.callbacks = null;
  }
}
