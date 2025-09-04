/**
 * Domain Factory: EnemyFactory
 * Creates enemy instances based on Joe's balance specifications
 */

import { Enemy, EnemyType, EnemyBehavior, EnemyStats, EnemyPosition } from '../entities/Enemy';

export class EnemyFactory {
  /**
   * Create enemy based on type and level
   */
  static createEnemy(
    id: string,
    type: EnemyType,
    position: EnemyPosition,
    level: number = 1
  ): Enemy {
    const enemyConfig = this.getEnemyConfig(type, level);
    
    return new Enemy(
      id,
      type,
      enemyConfig.behavior,
      position,
      enemyConfig.stats,
      enemyConfig.attackCooldown,
      enemyConfig.attackWindowDuration
    );
  }

  /**
   * Get enemy configuration based on Joe's balance specifications
   */
  private static getEnemyConfig(type: EnemyType, level: number) {
    const configs = {
      'DUMMY': {
        behavior: 'PEACEFUL' as EnemyBehavior,
        baseStats: { hp: 50, maxHp: 50, attack: 0, defense: 0, magicResist: 0, size: 20 },
        attackCooldown: 0,
        attackWindowDuration: 0
      },
      'HEX_PEACEFUL': {
        behavior: 'PEACEFUL' as EnemyBehavior,
        baseStats: { hp: 15, maxHp: 15, attack: 0, defense: 0, magicResist: 0, size: 15 },
        attackCooldown: 0,
        attackWindowDuration: 0
      },
      'TRI_SMALL': {
        behavior: 'NEUTRAL' as EnemyBehavior,
        baseStats: { hp: 25, maxHp: 25, attack: 4, defense: 1, magicResist: 0, size: 18 },
        attackCooldown: 3000,
        attackWindowDuration: 2000
      },
      'TRI_AGGRESSIVE': {
        behavior: 'AGGRESSIVE' as EnemyBehavior,
        baseStats: { hp: 35, maxHp: 35, attack: 6, defense: 2, magicResist: 1, size: 20 },
        attackCooldown: 2500,
        attackWindowDuration: 1800
      },
      'TRI_MEDIUM': {
        behavior: 'NEUTRAL' as EnemyBehavior,
        baseStats: { hp: 45, maxHp: 45, attack: 7, defense: 2, magicResist: 1, size: 22 },
        attackCooldown: 2000,
        attackWindowDuration: 1500
      },
      'TRI_ELITE': {
        behavior: 'AGGRESSIVE' as EnemyBehavior,
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
   * Scale enemy stats based on level using Joe's formulas
   */
  private static scaleStats(baseStats: EnemyStats, level: number): EnemyStats {
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
   * Create enemies for specific zones based on spawn configuration
   */
  static createZoneEnemies(zoneId: string): Enemy[] {
    const spawnConfigs = {
      'LOC_HUB_FIGUREIUM': [
        { type: 'DUMMY' as EnemyType, position: { x: 0, y: 0 }, level: 1 }
      ],
      'LOC_PEACEFUL_FIELDS': [
        { type: 'HEX_PEACEFUL' as EnemyType, position: { x: 50, y: 50 }, level: 1 },
        { type: 'HEX_PEACEFUL' as EnemyType, position: { x: -50, y: 50 }, level: 1 },
        { type: 'HEX_PEACEFUL' as EnemyType, position: { x: 0, y: -50 }, level: 1 }
      ],
      'LOC_SHARDS': [
        { type: 'TRI_SMALL' as EnemyType, position: { x: 100, y: 100 }, level: 2 },
        { type: 'TRI_SMALL' as EnemyType, position: { x: -100, y: 100 }, level: 2 },
        { type: 'TRI_AGGRESSIVE' as EnemyType, position: { x: 150, y: 150 }, level: 3 }
      ]
    };

    const config = spawnConfigs[zoneId as keyof typeof spawnConfigs];
    if (!config) return [];

    return config.map((enemyConfig, index) => 
      this.createEnemy(
        `${zoneId}_enemy_${index}`,
        enemyConfig.type,
        enemyConfig.position,
        enemyConfig.level
      )
    );
  }

  /**
   * Get enemy spawn configuration for a zone
   */
  static getZoneSpawnConfig(zoneId: string) {
    const configs = {
      'LOC_HUB_FIGUREIUM': {
        maxEnemies: 1,
        enemyTypes: ['DUMMY'],
        respawnTime: 0 // No respawn for training dummy
      },
      'LOC_PEACEFUL_FIELDS': {
        maxEnemies: 3,
        enemyTypes: ['HEX_PEACEFUL'],
        respawnTime: 30000 // 30 seconds
      },
      'LOC_SHARDS': {
        maxEnemies: 3,
        enemyTypes: ['TRI_SMALL', 'TRI_AGGRESSIVE'],
        respawnTime: 45000 // 45 seconds
      }
    };

    return configs[zoneId as keyof typeof configs] || null;
  }
}
