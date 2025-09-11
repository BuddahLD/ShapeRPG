/**
 * Domain Interface: Spell Repository
 * Defines contract for spell data access
 */

import { Spell } from '../../valueObjects/Spell';

export interface ISpellRepository {
  findById(id: string): Promise<Spell | null>;
  findAll(): Promise<Spell[]>;
  findByPattern(pattern: string): Promise<Spell[]>;
  findByLevel(level: number): Promise<Spell[]>;
  getSpellPattern(spellId: string): Promise<string | null>;
}
