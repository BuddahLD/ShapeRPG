/**
 * Infrastructure Repository Implementation: Spell Casting
 * Single Responsibility: Concrete implementation of spell casting data operations
 * SOLID: Depends only on Application layer, implements repository interface
 */

import { SpellCastingRepository, Spell } from '../../application/repositories/SpellCastingRepository';

export interface SpellCastingRepositoryDependencies {
  getSpellStats: (spellId: string) => any;
  castSpell: (matchResult: any) => void;
}

export class SpellCastingRepositoryImpl implements SpellCastingRepository {
  constructor(private dependencies: SpellCastingRepositoryDependencies) {}

  async getSpell(spellId: string): Promise<Spell | null> {
    const spellStats = this.dependencies.getSpellStats(spellId);
    
    if (!spellStats) {
      return null;
    }

    return {
      id: spellId,
      name: spellStats.name || spellId,
      castTime: spellStats.castTime
    };
  }

  async castSpell(spellId: string, direction?: { x: number; y: number } | null): Promise<void> {
    console.log('🎬 SpellCastingRepositoryImpl: castSpell called with spellId:', spellId);
    // Create match result for the completed cast
    const matchResult = {
      spellId: spellId,
      accuracy: 0.8, // Default accuracy for now
      isKnownPattern: true,
      debuffType: undefined as any
    };

    console.log('🎬 SpellCastingRepositoryImpl: Calling dependencies.castSpell');
    // Cast the spell through the game state
    this.dependencies.castSpell(matchResult);
  }
}
