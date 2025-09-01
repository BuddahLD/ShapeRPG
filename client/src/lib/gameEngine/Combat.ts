import { Player } from "./Player";
import { Enemy } from "./Enemy";

export class Combat {
  private activeEffects: Map<string, any> = new Map();

  public update(deltaTime: number): void {
    // Update active combat effects (DoT, buffs, debuffs, etc.)
    this.activeEffects.forEach((effect, id) => {
      effect.duration -= deltaTime;
      
      if (effect.duration <= 0) {
        this.activeEffects.delete(id);
        console.log(`Combat effect ${id} expired`);
      }
    });
  }

  public playerAttackEnemy(player: Player, enemy: Enemy): number {
    if (!player.isAlive() || !enemy.isAlive()) {
      return 0;
    }

    const baseDamage = player.stats.attack;
    const actualDamage = enemy.takeDamage(baseDamage);
    
    console.log(`Player attacked ${enemy.id} for ${actualDamage} damage`);
    
    // Award XP if enemy is defeated
    if (!enemy.isAlive()) {
      const xpGain = enemy.getExperienceValue();
      const goldGain = enemy.getGoldValue();
      
      player.addXP(xpGain);
      // Note: gold is handled by the domain layer, not here
      
      console.log(`Enemy defeated! Gained ${xpGain} XP`);
    }
    
    return actualDamage;
  }

  public enemyAttackPlayer(enemy: Enemy, player: Player): number {
    if (!enemy.isAlive() || !player.isAlive()) {
      return 0;
    }

    const baseDamage = enemy.stats.attack;
    const actualDamage = player.takeDamage(baseDamage);
    
    console.log(`Enemy ${enemy.id} attacked player for ${actualDamage} damage`);
    
    return actualDamage;
  }

  public performCounterattack(player: Player, enemy: Enemy): boolean {
    if (!enemy.canBeCounterattacked()) {
      return false;
    }

    // Successful counterattack
    const counterDamage = Math.floor(player.stats.attack * 1.5); // 1.5x damage
    enemy.takeDamage(counterDamage);
    
    console.log(`Successful counterattack! Dealt ${counterDamage} damage to ${enemy.id}`);
    
    // Award XP for successful counterattack
    player.addXP(5);
    
    return true;
  }

  public applySpellEffect(spell: any, caster: Player, target: Enemy | Player): void {
    switch (spell.effect.type) {
      case "damage":
        if (target instanceof Enemy) {
          target.takeDamage(spell.effect.amount);
        }
        break;
        
      case "damage+slow":
        if (target instanceof Enemy) {
          target.takeDamage(spell.effect.damage);
          // Apply slow effect (would need to implement in Enemy class)
        }
        break;
        
      case "buff":
        if (target instanceof Player) {
          // Apply temporary buff
          this.applyTemporaryBuff(target, spell.effect);
        }
        break;
        
      case "debuff":
        // Apply debuff effects
        this.applyDebuff(spell.effect);
        break;
        
      default:
        console.log(`Unknown spell effect type: ${spell.effect.type}`);
    }
  }

  private applyTemporaryBuff(player: Player, effect: any): void {
    // Apply temporary stat buffs
    if (effect.defPlus) {
      // This would need to be implemented in the Player class
      console.log(`Applied +${effect.defPlus} defense buff for ${effect.durationSec}s`);
    }
  }

  private applyDebuff(effect: any): void {
    // Apply debuff effects
    switch (effect.effect) {
      case "self_damage":
        console.log(`Applied self-damage debuff: ${effect.amount} damage`);
        break;
      case "slow_player":
        console.log(`Applied slow debuff: ${effect.multiplier}x speed for ${effect.durationSec}s`);
        break;
      case "screen_blackout":
        console.log(`Applied blackout debuff for ${effect.durationSec}s`);
        break;
      case "atk_scale":
        console.log(`Applied weakness debuff: ${effect.multiplier}x attack for ${effect.durationSec}s`);
        break;
      default:
        console.log(`Unknown debuff effect: ${effect.effect}`);
    }
  }

  private calculateXPGain(enemy: Enemy): number {
    return enemy.getExperienceValue();
  }

  private calculateGoldGain(enemy: Enemy): number {
    return enemy.getGoldValue();
  }
}
