/**
 * Infrastructure: Combat Service Implementation
 * Concrete implementation of ICombatService using Joe's balance formulas
 */

import { Player } from '../../domain/entities/Player';
import { Mob } from '../../domain/entities/Mob';
import { Spell } from '../../domain/valueObjects/Spell';
import { ICombatService, CombatResult, SpellCastResult } from '../../domain/interfaces/services/ICombatService';
import { CombatService as CombatCalculator } from '../../application/services/CombatService';

export class CombatServiceImpl implements ICombatService {
  private combatCalculator = new CombatCalculator();

  playerAttackMob(player: Player, mob: Mob): CombatResult {
    if (!player.isAlive() || !mob.isAlive()) {
      throw new Error('Combat participants must be alive');
    }

    // Convert Player stats to CombatService format
    const playerStats = {
      hp: player.stats.hp,
      maxHp: player.stats.maxHp,
      atk: player.stats.attack,
      magicPower: player.stats.attack, // TODO: Add magicPower to Player stats
      def: player.stats.defense,
      magicResist: player.stats.defense, // TODO: Add magicResist to Player stats
      critChance: 0.05, // TODO: Add critChance to Player stats
      critMultiplier: 1.5 // TODO: Add critMultiplier to Player stats
    };

    const combatResult = this.combatCalculator.calculatePlayerPhysicalDamage(playerStats, mob);
    const damagedMob = mob.takeDamage(combatResult.damage, false);

    return {
      attacker: player,
      target: damagedMob,
      damage: combatResult.actualDamage,
      wasCounterattack: false
    };
  }

  mobAttackPlayer(mob: Mob, player: Player): CombatResult {
    if (!mob.isAlive() || !player.isAlive()) {
      throw new Error('Combat participants must be alive');
    }

    // Convert Player stats to CombatService format
    const playerStats = {
      hp: player.stats.hp,
      maxHp: player.stats.maxHp,
      atk: player.stats.attack,
      magicPower: player.stats.attack, // TODO: Add magicPower to Player stats
      def: player.stats.defense,
      magicResist: player.stats.defense, // TODO: Add magicResist to Player stats
      critChance: 0.05, // TODO: Add critChance to Player stats
      critMultiplier: 1.5 // TODO: Add critMultiplier to Player stats
    };

    const combatResult = this.combatCalculator.calculateMobDamage(mob, playerStats);
    const damagedPlayer = player.takeDamage(combatResult.damage);

    return {
      attacker: mob,
      target: damagedPlayer,
      damage: combatResult.actualDamage,
      wasCounterattack: false
    };
  }

  performCounterattack(player: Player, mob: Mob): CombatResult | null {
    if (!mob.canBeCounterattacked()) {
      return null;
    }

    if (!player.isAlive() || !mob.isAlive()) {
      throw new Error('Combat participants must be alive');
    }

    // Convert Player stats to CombatService format
    const playerStats = {
      hp: player.stats.hp,
      maxHp: player.stats.maxHp,
      atk: player.stats.attack,
      magicPower: player.stats.attack, // TODO: Add magicPower to Player stats
      def: player.stats.defense,
      magicResist: player.stats.defense, // TODO: Add magicResist to Player stats
      critChance: 0.05, // TODO: Add critChance to Player stats
      critMultiplier: 1.5 // TODO: Add critMultiplier to Player stats
    };

    const counterattackResult = this.combatCalculator.calculateCounterattack(
      playerStats, 
      mob, 
      mob.counterWindow, 
      mob.attackCooldown
    );

    if (!counterattackResult.success) {
      return null;
    }

    const damagedMob = mob.takeDamage(counterattackResult.damage, false).endAttack();

    return {
      attacker: player,
      target: damagedMob,
      damage: counterattackResult.damage,
      wasCounterattack: true
    };
  }

  castSpell(caster: Player, target: Player | Mob, spell: Spell, accuracy: number): SpellCastResult {
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
        if (target instanceof Mob) {
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
  calculateDamage(attacker: Player | Mob, target: Player | Mob, baseMultiplier: number = 1.0): number {
    const attackerStats = attacker instanceof Player ? attacker.stats : attacker.stats;
    const targetStats = target instanceof Player ? target.stats : target.stats;
    
    const baseDamage = attackerStats.attack * baseMultiplier;
    return Math.max(1, baseDamage - targetStats.defense);
  }

  isInCombatRange(attacker: Player | Mob, target: Player | Mob, range: number = 100): boolean {
    const attackerPos = attacker instanceof Player ? attacker.position : attacker.position;
    const targetPos = target instanceof Player ? target.position : target.position;

    const distance = Math.sqrt(
      Math.pow(attackerPos.x - targetPos.x, 2) + 
      Math.pow(attackerPos.y - targetPos.y, 2)
    );

    return distance <= range;
  }
}