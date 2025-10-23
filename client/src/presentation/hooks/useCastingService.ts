/**
 * Presentation Hook: Casting Service Integration
 * Single Responsibility: Provide casting service to UI components
 * SOLID: Depends only on Application layer, provides clean interface for components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CastingService, CastingState } from '../../application/services/CastingService';
import { SpellCastingRepositoryImpl } from '../../infrastructure/repositories/SpellCastingRepositoryImpl';
import { AnimationService } from '../../infrastructure/services/AnimationService';
import { useGameState } from './useGameStateManager';
import { useSpellManager } from './useSpellManager';

export function useCastingService() {
  const { castSpell } = useGameState();
  const { getSpellStats } = useSpellManager();
  const [castingState, setCastingState] = useState<CastingState>({
    isCasting: false,
    castSpellId: null,
    castDirection: null
  });

  const castingServiceRef = useRef<CastingService | null>(null);

  // Initialize casting service
  useEffect(() => {
    const repository = new SpellCastingRepositoryImpl({
      getSpellStats,
      castSpell
    });
    // No need for AnimationService - we're using CSS animations
    const castingService = new CastingService(repository);

    // Set up callbacks
    castingService.setCallbacks({
      onCastingStart: (spellId: string) => {
        setCastingState(prev => ({
          ...prev,
          isCasting: true,
          castSpellId: spellId
        }));
      },
      onCastingComplete: (spellId: string) => {
        setCastingState(prev => ({
          ...prev,
          isCasting: false,
          castSpellId: null,
          castDirection: null
        }));
      },
      onCastingCancel: () => {
        setCastingState(prev => ({
          ...prev,
          isCasting: false,
          castSpellId: null,
          castDirection: null
        }));
      }
    });

    castingServiceRef.current = castingService;

    return () => {
      castingService.dispose();
    };
  }, []);

  // Start casting
  const startCasting = useCallback(async (spellId: string) => {
    if (castingServiceRef.current) {
      try {
        await castingServiceRef.current.startCasting(spellId);
      } catch (error) {
        console.error('Failed to start casting:', error);
      }
    }
  }, []);

  // Cancel casting
  const cancelCasting = useCallback(async () => {
    if (castingServiceRef.current) {
      try {
        await castingServiceRef.current.cancelCasting();
      } catch (error) {
        console.error('Failed to cancel casting:', error);
      }
    }
  }, []);

  // Get current state
  const getCastingState = useCallback(() => {
    return castingServiceRef.current?.getCastingState() || castingState;
  }, [castingState]);

  return {
    castingState,
    startCasting,
    cancelCasting,
    getCastingState
  };
}
