/**
 * Domain Interface: Combat Service
 * Defines the contract for combat operations
 */

import { Player } from '../../entities/Player';
import { Mob } from '../../entities/Mob';
import { Spell } from '../../valueObjects/Spell';

export interface CombatResult {
  readonly attacker: Player | Mob;
  readonly target: Player | Mob;
  readonly damage: number;
  readonly wasCounterattack: boolean;
}

export interface SpellCastResult {
  readonly caster: Player;
  readonly target: Player | Mob;
  readonly spell: Spell;
  readonly accuracy: number;
  readonly success: boolean;
}

export interface ICombatService {
  playerAttackMob(player: Player, mob: Mob): CombatResult;
  mobAttackPlayer(mob: Mob, player: Player): CombatResult;
  performCounterattack(player: Player, mob: Mob): CombatResult | null;
  castSpell(caster: Player, target: Player | Mob, spell: Spell, accuracy: number): SpellCastResult;
}