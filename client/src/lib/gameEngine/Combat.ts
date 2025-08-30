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

    const baseDamage = player.stats.atk;
    const actualDamage = enemy.takeDamage(baseDamage);
    
    console.log(`Player attacked ${enemy.id} for ${actualDamage} damage`);
    
    // Award XP if enemy is defeated
    if (!enemy.isAlive()) {
      const xpGain = this.calculateXPGain(enemy);
      const goldGain = this.calculateGoldGain(enemy);
      
      player.addXP(xpGain);
      player.gold += goldGain;
      
      console.log(`Enemy defeated! Gained ${xpGain} XP and ${goldGain} gold`);
    }
    
    return actualDamage;
  }

  public enemyAttackPlayer(enemy: Enemy, player: Player): number {
    if (!enemy.isAlive() || !player.isAlive()) {
      return 0;
    }

    const baseDamage = enemy.atk;
    const actualDamage = player.takeDamage(baseDamage);
    
    console.log(`Enemy ${enemy.id} attacked player for ${actualDamage} damage`);
    
    return actualDamage;
  }

  public performCounterattack(player: Player, enemy: Enemy): boolean {
    if (!enemy.canBeCounterattacked()) {
      return false;
    }

    // Successful counterattack
    const counterDamage = Math.floor(player.stats.atk * 1.5); // 1.5x damage
    enemy.takeDamage(counterDamage);
    enemy.isAttacking = false;
    enemy.counterWindow = 0;
    
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
    }
  }

  private applyTemporaryBuff(player: Player, effect: any): void {
    const buffId = `buff_${Date.now()}`;
    const duration = effect.durationSec * 1000;
    
    // Apply stat bonuses immediately
    if (effect.defPlus) {
      player.stats.def += effect.defPlus;
    }
    
    // Store the buff for later removal
    this.activeEffects.set(buffId, {
      type: "buff",
      target: player,
      effect: effect,
      duration: duration
    });
    
    console.log(`Applied buff: +${effect.defPlus} DEF for ${effect.durationSec}s`);
  }

  private applyDebuff(effect: any): void {
    // Apply various debuff effects
    console.log(`Applied debuff: ${effect.effect}`);
    
    // These would be implemented based on the specific debuff type
    // For now, just log the effect
  }

  private calculateXPGain(enemy: Enemy): number {
    // Base XP based on enemy type
    const xpValues: { [key: string]: number } = {
      "TRI_SMALL": 10,
      "TRI_MEDIUM": 20,
      "TRI_ELITE": 50
    };
    
    return xpValues[enemy.type] || 5;
  }

  private calculateGoldGain(enemy: Enemy): number {
    // Random gold based on enemy type
    const goldRanges: { [key: string]: [number, number] } = {
      "TRI_SMALL": [5, 10],
      "TRI_MEDIUM": [10, 20],
      "TRI_ELITE": [20, 40]
    };
    
    const range = goldRanges[enemy.type] || [1, 5];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }
}
