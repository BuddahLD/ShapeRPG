/**
 * Domain Factory: MobFactory
 * Creates mob instances based on Joe's balance specifications
 */

import { Mob, MobType, MobBehavior, MobStats, MobPosition } from '../entities/Mob';

export class MobFactory {
  /**
   * Create mob based on type and level
   */
  static createMob(
    id: string,
    type: MobType,
    position: MobPosition,
    level: number = 1
  ): Mob {
    const mobConfig = this.getMobConfig(type, level);
    
    return new Mob(
      id,
      type,
      mobConfig.behavior,
      position,
      mobConfig.stats,
      mobConfig.attackCooldown,
      mobConfig.attackWindowDuration
    );
  }

  /**
   * Get mob configuration based on Joe's balance specifications
   */
  private static getMobConfig(type: MobType, level: number) {
    const configs = {
      'DUMMY': {
        behavior: 'PEACEFUL' as MobBehavior,
        baseStats: { hp: 50, maxHp: 50, attack: 0, defense: 0, magicResist: 0, size: 20 },
        attackCooldown: 0,
        attackWindowDuration: 0
      },
      'HEX_PEACEFUL': {
        behavior: 'PEACEFUL' as MobBehavior,
        baseStats: { hp: 15, maxHp: 15, attack: 0, defense: 0, magicResist: 0, size: 15 },
        attackCooldown: 0,
        attackWindowDuration: 0
      },
      'TRI_SMALL': {
        behavior: 'NEUTRAL' as MobBehavior,
        baseStats: { hp: 25, maxHp: 25, attack: 4, defense: 1, magicResist: 0, size: 18 },
        attackCooldown: 3000,
        attackWindowDuration: 2000
      },
      'TRI_AGGRESSIVE': {
        behavior: 'AGGRESSIVE' as MobBehavior,
        baseStats: { hp: 35, maxHp: 35, attack: 6, defense: 2, magicResist: 1, size: 20 },
        attackCooldown: 2500,
        attackWindowDuration: 1800
      },
      'TRI_MEDIUM': {
        behavior: 'NEUTRAL' as MobBehavior,
        baseStats: { hp: 45, maxHp: 45, attack: 7, defense: 2, magicResist: 1, size: 22 },
        attackCooldown: 2000,
        attackWindowDuration: 1500
      },
      'TRI_ELITE': {
        behavior: 'AGGRESSIVE' as MobBehavior,
        baseStats: { hp: 80, maxHp: 80, attack: 12, defense: 4, magicResist: 2, size: 25 },
        attackCooldown: 1500,
        attackWindowDuration: 1000
      }
    };

    const config = configs[type];
    const scaledStats = this.scaleStats(config.baseStats, level);

    return {
      behavior: config.behavior,
      stats: scaledStats,
      attackCooldown: config.attackCooldown,
      attackWindowDuration: config.attackWindowDuration
    };
  }

  /**
   * Scale mob stats based on level using Joe's formulas
   */
  private static scaleStats(baseStats: MobStats, level: number): MobStats {
    if (level <= 1) return baseStats;

    return {
      ...baseStats,
      hp: Math.floor(baseStats.hp * (1 + (level - 1) * 0.8)),
      maxHp: Math.floor(baseStats.maxHp * (1 + (level - 1) * 0.8)),
      attack: Math.floor(baseStats.attack * (1 + (level - 1) * 0.6)),
      defense: Math.floor(baseStats.defense * (1 + (level - 1) * 0.4)),
      magicResist: Math.floor(baseStats.magicResist * (1 + (level - 1) * 0.3)),
      size: baseStats.size // Size doesn't scale
    };
  }

  /**
   * Create mobs for specific zones based on spawn configuration
   */
  static createZoneMobs(zoneId: string): Mob[] {
    const spawnConfigs = {
      'LOC_HUB_FIGUREIUM': [
        { type: 'DUMMY' as MobType, position: { x: -150, y: 120 }, level: 1 }
      ],
      'LOC_PEACEFUL_FIELDS': [
        { type: 'HEX_PEACEFUL' as MobType, position: { x: 300, y: 50 }, level: 1 },
        { type: 'HEX_PEACEFUL' as MobType, position: { x: 400, y: -50 }, level: 1 },
        { type: 'HEX_PEACEFUL' as MobType, position: { x: 500, y: 0 }, level: 1 },
        { type: 'HEX_PEACEFUL' as MobType, position: { x: 350, y: 100 }, level: 1 },
        { type: 'HEX_PEACEFUL' as MobType, position: { x: 450, y: -100 }, level: 1 }
      ],
      'LOC_SHARDS': [
        { type: 'TRI_SMALL' as MobType, position: { x: 700, y: 100 }, level: 2 },
        { type: 'TRI_SMALL' as MobType, position: { x: 800, y: -100 }, level: 2 },
        { type: 'TRI_AGGRESSIVE' as MobType, position: { x: 900, y: 200 }, level: 3 },
        { type: 'TRI_SMALL' as MobType, position: { x: 750, y: -200 }, level: 2 },
        { type: 'TRI_SMALL' as MobType, position: { x: 1000, y: 0 }, level: 2 }
      ]
    };

    const config = spawnConfigs[zoneId as keyof typeof spawnConfigs];
    if (!config) return [];

    return config.map((mobConfig, index) => 
      this.createMob(
        `${zoneId}_mob_${index}`,
        mobConfig.type,
        mobConfig.position,
        mobConfig.level
      )
    );
  }

  /**
   * Get mob spawn configuration for a zone
   */
  static getZoneSpawnConfig(zoneId: string) {
    const configs = {
      'LOC_HUB_FIGUREIUM': {
        maxMobs: 1,
        mobTypes: ['DUMMY'],
        respawnTime: 0 // No respawn for training dummy
      },
      'LOC_PEACEFUL_FIELDS': {
        maxMobs: 3,
        mobTypes: ['HEX_PEACEFUL'],
        respawnTime: 30000 // 30 seconds
      },
      'LOC_SHARDS': {
        maxMobs: 3,
        mobTypes: ['TRI_SMALL', 'TRI_AGGRESSIVE'],
        respawnTime: 45000 // 45 seconds
      }
    };

    return configs[zoneId as keyof typeof configs] || null;
  }
}
