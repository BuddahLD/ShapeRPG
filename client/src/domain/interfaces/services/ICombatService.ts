/**
 * Domain Interface: Combat Service
 * Defines the contract for combat operations
 */

import { Player } from '../../entities/Player';
import { Enemy } from '../../entities/Enemy';
import { Spell } from '../../valueObjects/Spell';

export interface CombatResult {
  readonly attacker: Player | Enemy;
  readonly target: Player | Enemy;
  readonly damage: number;
  readonly wasCounterattack: boolean;
}

export interface SpellCastResult {
  readonly caster: Player;
  readonly target: Player | Enemy;
  readonly spell: Spell;
  readonly accuracy: number;
  readonly success: boolean;
}

export interface ICombatService {
  playerAttackEnemy(player: Player, enemy: Enemy): CombatResult;
  enemyAttackPlayer(enemy: Enemy, player: Player): CombatResult;
  performCounterattack(player: Player, enemy: Enemy): CombatResult | null;
  castSpell(caster: Player, target: Player | Enemy, spell: Spell, accuracy: number): SpellCastResult;
}