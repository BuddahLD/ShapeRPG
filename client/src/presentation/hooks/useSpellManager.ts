/**
 * Presentation Hook: Spell Manager Integration
 * Provides React hooks for accessing spell data
 */

import { useState, useEffect } from 'react';
import { AppBootstrapService } from '../../application/AppBootstrapService';

export function useSpellManager() {
  const [spellPatterns, setSpellPatterns] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSpellPatterns = async () => {
      try {
        const appBootstrap = AppBootstrapService.getInstance();
        const gameStateService = appBootstrap.getGameStateService();
        
        // Get spell repository from the game state service
        // We'll need to add a getter for this in GameStateService
        const patterns = new Map<string, string>();
        
        // For now, we'll use the known patterns from our spell definitions
        patterns.set('SPL01', 'triangle');
        patterns.set('SPL02', 'zigzag');
        patterns.set('SPL03', 'circle');
        patterns.set('SPL04', 'wave');
        
        setSpellPatterns(patterns);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load spell patterns:', error);
        setIsLoading(false);
      }
    };

    loadSpellPatterns();
  }, []);

  const getSpellPattern = (spellId: string): string | null => {
    return spellPatterns.get(spellId) || null;
  };

  const getSpellName = (spellId: string): string => {
    const spellNames: Record<string, string> = {
      'SPL01': 'Fire Bolt',
      'SPL02': 'Ice Shard',
      'SPL03': 'Shield Aura',
      'SPL04': 'Dark Mist'
    };
    return spellNames[spellId] || spellId;
  };

  const getSpellDescription = (spellId: string): string => {
    const descriptions: Record<string, string> = {
      'SPL01': 'A basic fire spell that deals damage to enemies. Draw a triangle to cast.',
      'SPL02': 'An ice spell that deals damage and slows enemies. Draw a zigzag pattern to cast.',
      'SPL03': 'A protective spell that increases defense. Draw a circle to cast.',
      'SPL04': 'A dark spell that blinds enemies. Draw a wave pattern to cast.'
    };
    return descriptions[spellId] || 'Unknown spell';
  };

  const getSpellStats = (spellId: string): { mana: number; castTime: number; damage: number } => {
    const stats: Record<string, { mana: number; castTime: number; damage: number }> = {
      'SPL01': { mana: 5, castTime: 1.0, damage: 10 },
      'SPL02': { mana: 8, castTime: 1.2, damage: 8 },
      'SPL03': { mana: 12, castTime: 1.5, damage: 0 }, // Shield spell
      'SPL04': { mana: 15, castTime: 2.0, damage: 0 }  // Special effect spell
    };
    return stats[spellId] || { mana: 0, castTime: 0, damage: 0 };
  };

  return {
    getSpellPattern,
    getSpellName,
    getSpellDescription,
    getSpellStats,
    isLoading
  };
}
