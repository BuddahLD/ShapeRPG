/**
 * Application Service: EnemyManager
 * Manages enemy spawning, lifecycle, and zone-based enemy management
 */

import { Enemy, EnemyType, EnemyPosition } from '../../domain/entities/Enemy';
import { EnemyFactory } from '../../domain/factories/EnemyFactory';

export interface EnemySpawnConfig {
  zoneId: string;
  maxEnemies: number;
  enemyTypes: EnemyType[];
  respawnTime: number;
}

export interface EnemyUpdateResult {
  enemies: Enemy[];
  events: EnemyEvent[];
}

export interface EnemyEvent {
  type: 'SPAWN' | 'DEATH' | 'DAMAGE' | 'ATTACK_START' | 'ATTACK_END';
  enemyId: string;
  data?: any;
}

export class EnemyManager {
  private enemies: Map<string, Enemy> = new Map();
  private spawnConfigs: Map<string, EnemySpawnConfig> = new Map();
  private respawnTimers: Map<string, number> = new Map();
  private lastUpdateTime: number = 0;
  private spawnDistance: number = 400; // Distance from player to spawn enemies (increased for better visibility)
  private despawnDistance: number = 500; // Distance from player to despawn enemies

  constructor() {
    this.initializeSpawnConfigs();
  }

  /**
   * Initialize spawn configurations for all zones
   */
  private initializeSpawnConfigs(): void {
    const zones = ['LOC_HUB_FIGUREIUM', 'LOC_PEACEFUL_FIELDS', 'LOC_SHARDS'];
    
    zones.forEach(zoneId => {
      const config = EnemyFactory.getZoneSpawnConfig(zoneId);
      if (config) {
        this.spawnConfigs.set(zoneId, config);
      }
    });
  }

  /**
   * Update enemy spawning based on player position
   */
  updateEnemySpawning(playerPosition: { x: number; y: number }, currentZone: string): EnemyEvent[] {
    const events: EnemyEvent[] = [];
    
    // Clear enemies from other zones first (only if beyond despawn distance)
    this.clearEnemiesFromOtherZones(currentZone, playerPosition);
    
    // Get potential spawn points for ALL zones (not just current zone)
    const allZones = ['LOC_HUB_FIGUREIUM', 'LOC_PEACEFUL_FIELDS', 'LOC_SHARDS'];
    const allSpawnPoints = allZones.flatMap(zone => this.getPotentialSpawnPoints(zone));
    
    // Check which enemies should be spawned from any zone
    allSpawnPoints.forEach(spawnPoint => {
      const distance = this.calculateDistance(playerPosition, spawnPoint.position);
      const spawnPointZone = this.getEnemyZone(spawnPoint.id);
      // Reduced logging - only log when actually spawning
      // console.log(`EnemyManager: Checking spawn point ${spawnPoint.id} from zone ${spawnPointZone} at ${spawnPoint.position.x},${spawnPoint.position.y}, distance: ${distance.toFixed(2)}, spawnDistance: ${this.spawnDistance}, alreadySpawned: ${this.enemies.has(spawnPoint.id)}`);
      
      // Spawn if within spawn distance and not already spawned
      if (distance <= this.spawnDistance && !this.enemies.has(spawnPoint.id)) {
        const enemy = EnemyFactory.createEnemy(
          spawnPoint.id,
          spawnPoint.type,
          spawnPoint.position,
          spawnPoint.level
        );
        
        this.enemies.set(enemy.id, enemy);
        events.push({
          type: 'SPAWN',
          enemyId: enemy.id,
          data: { enemy }
        });
        console.log(`EnemyManager: Spawned enemy ${enemy.id} from zone ${spawnPointZone} at ${enemy.position.x},${enemy.position.y}`);
      }
    });
    
    // Check which enemies should be despawned
    const enemiesToDespawn: string[] = [];
    this.enemies.forEach((enemy, enemyId) => {
      const distance = this.calculateDistance(playerPosition, enemy.position);
      
      // Despawn if too far away
      if (distance > this.despawnDistance) {
        enemiesToDespawn.push(enemyId);
      }
    });
    
    // Remove distant enemies
    enemiesToDespawn.forEach(enemyId => {
      this.enemies.delete(enemyId);
      this.respawnTimers.delete(enemyId);
    });
    
    return events;
  }

  /**
   * Clear enemies from zones other than the current one, but only if they're beyond despawn distance
   */
  private clearEnemiesFromOtherZones(currentZone: string, playerPosition?: { x: number; y: number }): void {
    const enemiesToRemove: string[] = [];
    
    this.enemies.forEach((enemy, enemyId) => {
      // Check if enemy belongs to a different zone
      const enemyZone = this.getEnemyZone(enemyId);
      if (enemyZone && enemyZone !== currentZone) {
        // Only remove if player position is provided and enemy is beyond despawn distance
        if (playerPosition) {
          const distance = this.calculateDistance(playerPosition, enemy.position);
          if (distance > this.despawnDistance) {
            enemiesToRemove.push(enemyId);
            console.log(`EnemyManager: Removing enemy ${enemyId} from zone ${enemyZone} (distance: ${distance.toFixed(2)} > ${this.despawnDistance})`);
          } else {
            // Reduced logging - only log when despawning
            // console.log(`EnemyManager: Keeping enemy ${enemyId} from zone ${enemyZone} (distance: ${distance.toFixed(2)} <= ${this.despawnDistance})`);
          }
        } else {
          // If no player position, remove all enemies from other zones (fallback)
          enemiesToRemove.push(enemyId);
        }
      }
    });
    
    // Remove enemies from other zones
    enemiesToRemove.forEach(enemyId => {
      this.enemies.delete(enemyId);
      this.respawnTimers.delete(enemyId);
    });
  }

  /**
   * Get the zone for an enemy based on its ID
   */
  private getEnemyZone(enemyId: string): string | null {
    if (enemyId.startsWith('hub_')) return 'LOC_HUB_FIGUREIUM';
    if (enemyId.startsWith('fields_')) return 'LOC_PEACEFUL_FIELDS';
    if (enemyId.startsWith('shards_')) return 'LOC_SHARDS';
    return null;
  }

  /**
   * Get potential spawn points for a zone
   */
  private getPotentialSpawnPoints(zoneId: string): Array<{
    id: string;
    type: import('../../domain/entities/Enemy').EnemyType;
    position: { x: number; y: number };
    level: number;
  }> {
    const spawnPoints: Array<{
      id: string;
      type: import('../../domain/entities/Enemy').EnemyType;
      position: { x: number; y: number };
      level: number;
    }> = [];

    switch (zoneId) {
      case 'LOC_HUB_FIGUREIUM':
        spawnPoints.push({
          id: 'hub_dummy_1',
          type: 'DUMMY',
          position: { x: -150, y: 120 }, // Bottom left corner, moved up 30px
          level: 1
        });
        break;
        
      case 'LOC_PEACEFUL_FIELDS':
        // Fields area: x: 200-600, y: -150-150
        spawnPoints.push(
          { id: 'fields_hex_1', type: 'HEX_PEACEFUL', position: { x: 300, y: 50 }, level: 1 },
          { id: 'fields_hex_2', type: 'HEX_PEACEFUL', position: { x: 400, y: -50 }, level: 1 },
          { id: 'fields_hex_3', type: 'HEX_PEACEFUL', position: { x: 500, y: 0 }, level: 1 },
          { id: 'fields_hex_4', type: 'HEX_PEACEFUL', position: { x: 350, y: 100 }, level: 1 },
          { id: 'fields_hex_5', type: 'HEX_PEACEFUL', position: { x: 450, y: -100 }, level: 1 }
        );
        break;
        
      case 'LOC_SHARDS':
        // Shards area: x: 600-1100, y: -450-450
        spawnPoints.push(
          { id: 'shards_tri_small_1', type: 'TRI_SMALL', position: { x: 700, y: 100 }, level: 2 },
          { id: 'shards_tri_small_2', type: 'TRI_SMALL', position: { x: 800, y: -100 }, level: 2 },
          { id: 'shards_tri_aggro_1', type: 'TRI_AGGRESSIVE', position: { x: 900, y: 200 }, level: 3 },
          { id: 'shards_tri_small_3', type: 'TRI_SMALL', position: { x: 750, y: -200 }, level: 2 },
          { id: 'shards_tri_small_4', type: 'TRI_SMALL', position: { x: 1000, y: 0 }, level: 2 }
        );
        break;
    }
    
    return spawnPoints;
  }

  /**
   * Calculate distance between two positions
   */
  private calculateDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get all enemies in a specific zone
   */
  getEnemiesInZone(zoneId: string): Enemy[] {
    return Array.from(this.enemies.values()).filter(enemy => 
      enemy.id.startsWith(zoneId)
    );
  }

  /**
   * Get all active enemies
   */
  getAllEnemies(): Enemy[] {
    return Array.from(this.enemies.values());
  }

  /**
   * Get enemy by ID
   */
  getEnemy(enemyId: string): Enemy | undefined {
    return this.enemies.get(enemyId);
  }

  /**
   * Update enemy state (called every frame)
   */
  updateEnemies(deltaTime: number, currentTime: number): EnemyUpdateResult {
    const events: EnemyEvent[] = [];
    const updatedEnemies: Enemy[] = [];

    // Update all enemies
    this.enemies.forEach((enemy, enemyId) => {
      let updatedEnemy = enemy;

      // Update counterattack window if enemy is attacking
      if (enemy.isAttacking) {
        updatedEnemy = enemy.updateCounterWindow(deltaTime);
        
        // Check if attack ended
        if (!updatedEnemy.isAttacking && enemy.isAttacking) {
          events.push({
            type: 'ATTACK_END',
            enemyId: enemyId,
            data: { enemy: updatedEnemy }
          });
        }
      }

      // Check if enemy died
      if (!updatedEnemy.isAlive() && enemy.isAlive()) {
        events.push({
          type: 'DEATH',
          enemyId: enemyId,
          data: { 
            enemy: updatedEnemy,
            xp: updatedEnemy.getExperienceValue(),
            gold: updatedEnemy.getGoldValue()
          }
        });

        // Schedule respawn
        this.scheduleRespawn(enemyId, updatedEnemy);
      }

      updatedEnemies.push(updatedEnemy);
      this.enemies.set(enemyId, updatedEnemy);
    });

    // Update respawn timers
    this.updateRespawnTimers(deltaTime, events);

    this.lastUpdateTime = currentTime;

    return {
      enemies: updatedEnemies,
      events
    };
  }

  /**
   * Handle enemy taking damage
   */
  damageEnemy(enemyId: string, damage: number, isMagical: boolean = false): EnemyEvent | null {
    const enemy = this.enemies.get(enemyId);
    if (!enemy || !enemy.isAlive()) return null;

    const damagedEnemy = enemy.takeDamage(damage, isMagical);
    this.enemies.set(enemyId, damagedEnemy);

    return {
      type: 'DAMAGE',
      enemyId: enemyId,
      data: { 
        enemy: damagedEnemy,
        damage,
        isMagical
      }
    };
  }

  /**
   * Handle enemy starting attack
   */
  startEnemyAttack(enemyId: string, currentTime: number): EnemyEvent | null {
    const enemy = this.enemies.get(enemyId);
    if (!enemy || !enemy.isAlive() || !enemy.canAttack(currentTime)) return null;

    const attackingEnemy = enemy.startAttack(currentTime);
    this.enemies.set(enemyId, attackingEnemy);

    return {
      type: 'ATTACK_START',
      enemyId: enemyId,
      data: { 
        enemy: attackingEnemy,
        counterWindow: attackingEnemy.counterWindow
      }
    };
  }

  /**
   * Handle counterattack on enemy
   */
  counterattackEnemy(enemyId: string, damage: number): EnemyEvent | null {
    const enemy = this.enemies.get(enemyId);
    if (!enemy || !enemy.canBeCounterattacked()) return null;

    const counterattackedEnemy = enemy.takeDamage(damage).endAttack();
    this.enemies.set(enemyId, counterattackedEnemy);

    return {
      type: 'DAMAGE',
      enemyId: enemyId,
      data: { 
        enemy: counterattackedEnemy,
        damage,
        isCounterattack: true
      }
    };
  }

  /**
   * Get enemies within range of a position
   */
  getEnemiesInRange(position: EnemyPosition, range: number): Enemy[] {
    return Array.from(this.enemies.values()).filter(enemy => 
      enemy.isAlive() && enemy.getDistanceToPosition(position) <= range
    );
  }

  /**
   * Get enemies that can attack the player
   */
  getAggressiveEnemiesInRange(position: EnemyPosition, range: number): Enemy[] {
    return this.getEnemiesInRange(position, range).filter(enemy => 
      enemy.willAttackPlayer()
    );
  }

  /**
   * Schedule enemy respawn
   */
  private scheduleRespawn(enemyId: string, deadEnemy: Enemy): void {
    const zoneId = enemyId.split('_')[0] + '_' + enemyId.split('_')[1];
    const config = this.spawnConfigs.get(zoneId);
    
    if (config && config.respawnTime > 0) {
      this.respawnTimers.set(enemyId, config.respawnTime);
    }
  }

  /**
   * Update respawn timers and spawn enemies when ready
   */
  private updateRespawnTimers(deltaTime: number, events: EnemyEvent[]): void {
    this.respawnTimers.forEach((timeLeft, enemyId) => {
      const newTimeLeft = timeLeft - deltaTime;
      
      if (newTimeLeft <= 0) {
        // Respawn enemy
        const zoneId = enemyId.split('_')[0] + '_' + enemyId.split('_')[1];
        const originalEnemy = this.enemies.get(enemyId);
        
        if (originalEnemy) {
          // Create new enemy at original position
          const newEnemy = EnemyFactory.createEnemy(
            enemyId,
            originalEnemy.type,
            originalEnemy.position,
            1 // TODO: Scale level based on player progress
          );
          
          this.enemies.set(enemyId, newEnemy);
          this.respawnTimers.delete(enemyId);
          
          events.push({
            type: 'SPAWN',
            enemyId: enemyId,
            data: { enemy: newEnemy }
          });
        }
      } else {
        this.respawnTimers.set(enemyId, newTimeLeft);
      }
    });
  }

  /**
   * Clear all enemies (for zone transitions)
   */
  clearEnemies(): void {
    this.enemies.clear();
    this.respawnTimers.clear();
  }

  /**
   * Clear enemies in specific zone
   */
  clearZoneEnemies(zoneId: string): void {
    const enemiesToRemove = Array.from(this.enemies.keys()).filter(id => 
      id.startsWith(zoneId)
    );
    
    enemiesToRemove.forEach(id => {
      this.enemies.delete(id);
      this.respawnTimers.delete(id);
    });
  }
}
