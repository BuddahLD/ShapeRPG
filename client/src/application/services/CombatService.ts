/**
 * Application Service: CombatService
 * Handles combat calculations, damage, and combat state management
 */

import { Enemy } from '../../domain/entities/Enemy';

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
   * Calculate physical damage dealt by player to enemy
   */
  calculatePlayerPhysicalDamage(playerStats: PlayerStats, enemy: Enemy): CombatResult {
    const baseDamage = playerStats.atk;
    const isCritical = Math.random() < playerStats.critChance;
    const critMultiplier = isCritical ? playerStats.critMultiplier : 1;
    const damage = Math.floor(baseDamage * critMultiplier);
    
    const actualDamage = enemy.takeDamage(damage, false).stats.hp !== enemy.stats.hp 
      ? enemy.stats.hp - enemy.takeDamage(damage, false).stats.hp 
      : 0;

    return {
      damage,
      isCritical,
      isCounterattack: false,
      actualDamage
    };
  }

  /**
   * Calculate magical damage dealt by player to enemy
   */
  calculatePlayerMagicalDamage(playerStats: PlayerStats, enemy: Enemy, spellPower: number = 1): CombatResult {
    const baseDamage = Math.floor(playerStats.magicPower * spellPower);
    const isCritical = Math.random() < playerStats.critChance;
    const critMultiplier = isCritical ? playerStats.critMultiplier : 1;
    const damage = Math.floor(baseDamage * critMultiplier);
    
    const actualDamage = enemy.takeDamage(damage, true).stats.hp !== enemy.stats.hp 
      ? enemy.stats.hp - enemy.takeDamage(damage, true).stats.hp 
      : 0;

    return {
      damage,
      isCritical,
      isCounterattack: false,
      actualDamage
    };
  }

  /**
   * Calculate damage dealt by enemy to player
   */
  calculateEnemyDamage(enemy: Enemy, playerStats: PlayerStats): CombatResult {
    const baseDamage = enemy.stats.attack;
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
    enemy: Enemy, 
    timingRemaining: number, 
    totalWindow: number
  ): CounterattackResult {
    if (!enemy.canBeCounterattacked()) {
      return { success: false, damage: 0, timingBonus: 0 };
    }

    // Base counterattack damage (150% of normal attack)
    const baseDamage = Math.floor(playerStats.atk * 1.5);
    
    // Timing bonus (up to 50% additional damage for perfect timing)
    const timingRatio = timingRemaining / totalWindow;
    const timingBonus = Math.max(0, timingRatio * 0.5);
    
    // Final damage calculation
    const finalDamage = Math.floor(baseDamage * (1 + timingBonus));
    
    // Apply enemy defense
    const actualDamage = Math.max(1, finalDamage - enemy.stats.defense);

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
   * Calculate experience gained from defeating enemy
   */
  calculateExperienceGain(enemy: Enemy, playerLevel: number): number {
    const baseExp = enemy.getExperienceValue();
    
    // Level difference affects XP gain
    const levelDiff = enemy.stats.maxHp / 10 - playerLevel; // Rough level estimation
    const levelMultiplier = Math.max(0.1, 1 + (levelDiff * 0.1));
    
    return Math.floor(baseExp * levelMultiplier);
  }

  /**
   * Calculate gold gained from defeating enemy
   */
  calculateGoldGain(enemy: Enemy): number {
    return enemy.getGoldValue();
  }

  /**
   * Check if player can counterattack
   */
  canPlayerCounterattack(enemy: Enemy): boolean {
    return enemy.canBeCounterattacked();
  }

  /**
   * Check if enemy can attack player
   */
  canEnemyAttackPlayer(enemy: Enemy, currentTime: number): boolean {
    return enemy.isAlive() && enemy.canAttack(currentTime);
  }

  /**
   * Get counterattack window remaining
   */
  getCounterattackWindowRemaining(enemy: Enemy): number {
    return enemy.counterWindow;
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
   * Get attack range for enemy type
   */
  getEnemyAttackRange(enemy: Enemy): number {
    // Base attack ranges by enemy type
    const attackRanges = {
      'DUMMY': 0,
      'HEX_PEACEFUL': 0,
      'TRI_SMALL': 30, // Melee range
      'TRI_AGGRESSIVE': 35, // Slightly longer melee range
      'TRI_MEDIUM': 40,
      'TRI_ELITE': 45
    };

    return attackRanges[enemy.type] || 30;
  }

  /**
   * Get visibility range for enemy type
   */
  getEnemyVisibilityRange(enemy: Enemy): number {
    // Visibility ranges for aggressive enemies
    const visibilityRanges = {
      'DUMMY': 0,
      'HEX_PEACEFUL': 0,
      'TRI_SMALL': 0, // Neutral - no visibility range
      'TRI_AGGRESSIVE': 80, // Aggressive - can see player
      'TRI_MEDIUM': 0, // Neutral
      'TRI_ELITE': 100 // Elite aggressive
    };

    return visibilityRanges[enemy.type] || 0;
  }
}
