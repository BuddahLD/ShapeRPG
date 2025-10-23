/**
 * Application Repository Interface: Spell Casting
 * Single Responsibility: Define contract for spell casting data operations
 * SOLID: Interface segregation - clients depend only on what they need
 */

export interface Spell {
  id: string;
  name: string;
  castTime: number;
  // Add other spell properties as needed
}

export interface SpellCastingRepository {
  getSpell(spellId: string): Promise<Spell | null>;
  castSpell(spellId: string, direction?: { x: number; y: number } | null): Promise<void>;
}
