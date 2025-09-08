/**
 * Application Service: CombatService
 * Handles combat calculations, damage, and combat state management
 */

import { Mob } from '../../domain/entities/Mob';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  atk: number;
  magicPower: number;
  def: number;
  magicResist: number;
  critChance: number;
  critMultiplier: number;
}

export interface CombatResult {
  damage: number;
  isCritical: boolean;
  isCounterattack: boolean;
  actualDamage: number;
}

export interface CounterattackResult {
  success: boolean;
  damage: number;
  timingBonus: number;
}

export class CombatService {
  /**
   * Calculate physical damage dealt by player to mob
   */
  calculatePlayerPhysicalDamage(playerStats: PlayerStats, mob: Mob): CombatResult {
    const baseDamage = playerStats.atk;
    const isCritical = Math.random() < playerStats.critChance;
    const critMultiplier = isCritical ? playerStats.critMultiplier : 1;
    const damage = Math.floor(baseDamage * critMultiplier);
    
    const actualDamage = mob.takeDamage(damage, false).stats.hp !== mob.stats.hp 
      ? mob.stats.hp - mob.takeDamage(damage, false).stats.hp 
      : 0;

    return {
      damage,
      isCritical,
      isCounterattack: false,
      actualDamage
    };
  }

  /**
   * Calculate magical damage dealt by player to mob
   */
  calculatePlayerMagicalDamage(playerStats: PlayerStats, mob: Mob, spellPower: number = 1): CombatResult {
    const baseDamage = Math.floor(playerStats.magicPower * spellPower);
    const isCritical = Math.random() < playerStats.critChance;
    const critMultiplier = isCritical ? playerStats.critMultiplier : 1;
    const damage = Math.floor(baseDamage * critMultiplier);
    
    const actualDamage = mob.takeDamage(damage, true).stats.hp !== mob.stats.hp 
      ? mob.stats.hp - mob.takeDamage(damage, true).stats.hp 
      : 0;

    return {
      damage,
      isCritical,
      isCounterattack: false,
      actualDamage
    };
  }

  /**
   * Calculate damage dealt by mob to player
   */
  calculateMobDamage(mob: Mob, playerStats: PlayerStats): CombatResult {
    const baseDamage = mob.stats.attack;
    const damage = Math.max(1, baseDamage - playerStats.def);
    
    return {
      damage,
      isCritical: false,
      isCounterattack: false,
      actualDamage: damage
    };
  }

  /**
   * Calculate counterattack damage and success
   */
  calculateCounterattack(
    playerStats: PlayerStats, 
    mob: Mob, 
    timingRemaining: number, 
    totalWindow: number
  ): CounterattackResult {
    if (!mob.canBeCounterattacked()) {
      return { success: false, damage: 0, timingBonus: 0 };
    }

    // Base counterattack damage (150% of normal attack)
    const baseDamage = Math.floor(playerStats.atk * 1.5);
    
    // Timing bonus (up to 50% additional damage for perfect timing)
    const timingRatio = timingRemaining / totalWindow;
    const timingBonus = Math.max(0, timingRatio * 0.5);
    
    // Final damage calculation
    const finalDamage = Math.floor(baseDamage * (1 + timingBonus));
    
    // Apply mob defense
    const actualDamage = Math.max(1, finalDamage - mob.stats.defense);

    return {
      success: true,
      damage: actualDamage,
      timingBonus: timingBonus
    };
  }

  /**
   * Calculate spell accuracy bonus/penalty
   */
  calculateSpellAccuracy(accuracy: number): number {
    // Accuracy affects damage by ±20%
    // accuracy: 0.0 = -20% damage, 1.0 = +20% damage
    return 0.8 + (accuracy * 0.4);
  }

  /**
   * Calculate experience gained from defeating mob
   */
  calculateExperienceGain(mob: Mob, playerLevel: number): number {
    const baseExp = mob.getExperienceValue();
    
    // Level difference affects XP gain
    const levelDiff = mob.stats.maxHp / 10 - playerLevel; // Rough level estimation
    const levelMultiplier = Math.max(0.1, 1 + (levelDiff * 0.1));
    
    return Math.floor(baseExp * levelMultiplier);
  }

  /**
   * Calculate gold gained from defeating mob
   */
  calculateGoldGain(mob: Mob): number {
    return mob.getGoldValue();
  }

  /**
   * Check if player can counterattack
   */
  canPlayerCounterattack(mob: Mob): boolean {
    return mob.canBeCounterattacked();
  }

  /**
   * Check if mob can attack player
   */
  canMobAttackPlayer(mob: Mob, currentTime: number): boolean {
    return mob.isAlive() && mob.canAttack(currentTime);
  }

  /**
   * Get counterattack window remaining
   */
  getCounterattackWindowRemaining(mob: Mob): number {
    return mob.counterWindow;
  }

  /**
   * Calculate distance between two positions
   */
  calculateDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if position is within attack range
   */
  isWithinAttackRange(
    attackerPos: { x: number; y: number }, 
    targetPos: { x: number; y: number }, 
    range: number
  ): boolean {
    return this.calculateDistance(attackerPos, targetPos) <= range;
  }

  /**
   * Get attack range for mob type
   */
  getMobAttackRange(mob: Mob): number {
    // Base attack ranges by mob type
    const attackRanges = {
      'DUMMY': 0,
      'HEX_PEACEFUL': 0,
      'TRI_SMALL': 30, // Melee range
      'TRI_AGGRESSIVE': 35, // Slightly longer melee range
      'TRI_MEDIUM': 40,
      'TRI_ELITE': 45
    };

    return attackRanges[mob.type] || 30;
  }

  /**
   * Get visibility range for mob type
   */
  getMobVisibilityRange(mob: Mob): number {
    // Visibility ranges for aggressive mobs
    const visibilityRanges = {
      'DUMMY': 0,
      'HEX_PEACEFUL': 0,
      'TRI_SMALL': 0, // Neutral - no visibility range
      'TRI_AGGRESSIVE': 80, // Aggressive - can see player
      'TRI_MEDIUM': 0, // Neutral
      'TRI_ELITE': 100 // Elite aggressive
    };

    return visibilityRanges[mob.type] || 0;
  }
}
