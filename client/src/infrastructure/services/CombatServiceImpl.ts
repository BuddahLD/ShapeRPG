/**
 * Infrastructure: Combat Service Implementation
 * Concrete implementation of ICombatService
 */

import { Player } from '../../domain/entities/Player';
import { Enemy } from '../../domain/entities/Enemy';
import { Spell } from '../../domain/valueObjects/Spell';
import { ICombatService, CombatResult, SpellCastResult } from '../../domain/interfaces/services/ICombatService';

export class CombatServiceImpl implements ICombatService {
  playerAttackEnemy(player: Player, enemy: Enemy): CombatResult {
    if (!player.isAlive() || !enemy.isAlive()) {
      throw new Error('Combat participants must be alive');
    }

    const damage = Math.max(1, player.stats.attack - enemy.stats.defense);
    const damagedEnemy = enemy.takeDamage(damage);

    return {
      attacker: player,
      target: damagedEnemy,
      damage,
      wasCounterattack: false
    };
  }

  enemyAttackPlayer(enemy: Enemy, player: Player): CombatResult {
    if (!enemy.isAlive() || !player.isAlive()) {
      throw new Error('Combat participants must be alive');
    }

    const damage = Math.max(1, enemy.stats.attack - player.stats.defense);
    const damagedPlayer = player.takeDamage(damage);

    return {
      attacker: enemy,
      target: damagedPlayer,
      damage,
      wasCounterattack: false
    };
  }

  performCounterattack(player: Player, enemy: Enemy): CombatResult | null {
    if (!enemy.canBeCounterattacked()) {
      return null;
    }

    if (!player.isAlive() || !enemy.isAlive()) {
      throw new Error('Combat participants must be alive');
    }

    // Counterattack deals 1.5x damage
    const damage = Math.floor(player.stats.attack * 1.5);
    const actualDamage = Math.max(1, damage - enemy.stats.defense);
    
    const damagedEnemy = enemy.takeDamage(actualDamage).endAttack();

    return {
      attacker: player,
      target: damagedEnemy,
      damage: actualDamage,
      wasCounterattack: true
    };
  }

  castSpell(caster: Player, target: Player | Enemy, spell: Spell, accuracy: number): SpellCastResult {
    if (!caster.isAlive()) {
      throw new Error('Caster must be alive');
    }

    if (!caster.canCastSpell(spell.id, spell.manaCost)) {
      return {
        caster,
        target,
        spell,
        accuracy,
        success: false
      };
    }

    // Consume mana
    const manaResult = caster.useMana(spell.manaCost);
    if (!manaResult.success) {
      return {
        caster,
        target,
        spell,
        accuracy,
        success: false
      };
    }

    let updatedCaster = manaResult.player;
    let updatedTarget = target;

    // Apply accuracy modifier
    const modifiedSpell = spell.withAccuracyModifier(accuracy);

    // Apply spell effect
    switch (modifiedSpell.effect.type) {
      case 'damage':
      case 'damage+slow':
        if (target instanceof Enemy) {
          updatedTarget = target.takeDamage(modifiedSpell.effect.amount);
        }
        break;

      case 'heal':
        if (target instanceof Player) {
          updatedTarget = target.heal(modifiedSpell.effect.amount);
        }
        break;

      case 'shield':
        // Shield effect would modify defense temporarily
        // This would require additional domain logic for temporary effects
        break;
    }

    return {
      caster: updatedCaster,
      target: updatedTarget,
      spell: modifiedSpell,
      accuracy,
      success: true
    };
  }

  // Additional combat utilities
  calculateDamage(attacker: Player | Enemy, target: Player | Enemy, baseMultiplier: number = 1.0): number {
    const attackerStats = attacker instanceof Player ? attacker.stats : attacker.stats;
    const targetStats = target instanceof Player ? target.stats : target.stats;
    
    const baseDamage = attackerStats.attack * baseMultiplier;
    return Math.max(1, baseDamage - targetStats.defense);
  }

  isInCombatRange(attacker: Player | Enemy, target: Player | Enemy, range: number = 100): boolean {
    const attackerPos = attacker instanceof Player ? attacker.position : attacker.position;
    const targetPos = target instanceof Player ? target.position : target.position;

    const distance = Math.sqrt(
      Math.pow(attackerPos.x - targetPos.x, 2) + 
      Math.pow(attackerPos.y - targetPos.y, 2)
    );

    return distance <= range;
  }
}