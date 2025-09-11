/**
 * Infrastructure: In-Memory Spell Repository
 * Implements spell data access using in-memory storage
 */

import { ISpellRepository } from '../../domain/interfaces/repositories/ISpellRepository';
import { Spell } from '../../domain/valueObjects/Spell';

export class InMemorySpellRepository implements ISpellRepository {
  private spells: Map<string, Spell> = new Map();

  constructor() {
    this.initializeSpells();
  }

  async findById(id: string): Promise<Spell | null> {
    return this.spells.get(id) || null;
  }

  async findAll(): Promise<Spell[]> {
    return Array.from(this.spells.values());
  }

  async findByPattern(pattern: string): Promise<Spell[]> {
    return Array.from(this.spells.values()).filter(spell => spell.pattern === pattern);
  }

  async findByLevel(level: number): Promise<Spell[]> {
    return Array.from(this.spells.values()).filter(spell => spell.level === level);
  }

  async getSpellPattern(spellId: string): Promise<string | null> {
    const spell = await this.findById(spellId);
    return spell ? spell.pattern : null;
  }

  private initializeSpells(): void {
    // SPL01 - Fire Bolt: Triangle pattern, Level 1, 5 mana, 1000ms cast, 10 damage
    const fireBolt = new Spell(
      'SPL01',
      'Fire Bolt',
      'triangle',
      1,
      5,
      1000,
      {
        type: 'damage',
        amount: 10
      },
      'A basic fire spell that deals damage to enemies. Draw a triangle to cast.'
    );

    // SPL02 - Ice Shard: Zigzag pattern, Level 2, 8 mana, 1200ms cast, 8 damage + 2s slow
    const iceShard = new Spell(
      'SPL02',
      'Ice Shard',
      'zigzag',
      2,
      8,
      1200,
      {
        type: 'damage+slow',
        amount: 8
      },
      'An ice spell that deals damage and slows enemies. Draw a zigzag pattern to cast.'
    );

    // SPL03 - Shield Aura: Circle pattern, Level 3, 12 mana, 1500ms cast, +5 DEF for 10s
    const shieldAura = new Spell(
      'SPL03',
      'Shield Aura',
      'circle',
      3,
      12,
      1500,
      {
        type: 'shield',
        amount: 5
      },
      'A protective spell that increases defense. Draw a circle to cast.'
    );

    // SPL04 - Dark Mist: Wave pattern, Level 4, 15 mana, 2000ms cast, 3s blackout for enemies
    const darkMist = new Spell(
      'SPL04',
      'Dark Mist',
      'wave',
      4,
      15,
      2000,
      {
        type: 'damage',
        amount: 0 // Special effect - blackout
      },
      'A dark spell that blinds enemies. Draw a wave pattern to cast.'
    );

    this.spells.set(fireBolt.id, fireBolt);
    this.spells.set(iceShard.id, iceShard);
    this.spells.set(shieldAura.id, shieldAura);
    this.spells.set(darkMist.id, darkMist);
  }
}
