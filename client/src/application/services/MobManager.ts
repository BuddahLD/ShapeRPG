/**
 * Application Service: MobManager
 * Manages mob spawning, lifecycle, and zone-based mob management
 */

import { Enemy, EnemyType, EnemyPosition } from '../../domain/entities/Enemy';
import { MobFactory } from '../../domain/factories/MobFactory';

export interface MobSpawnConfig {
  zoneId: string;
  maxMobs: number;
  mobTypes: EnemyType[];
  respawnTime: number;
}

export interface MobUpdateResult {
  mobs: Enemy[];
  events: MobEvent[];
}

export interface MobEvent {
  type: 'SPAWN' | 'DEATH' | 'DAMAGE' | 'ATTACK_START' | 'ATTACK_END';
  mobId: string;
  data?: any;
}

export class MobManager {
  private mobs: Map<string, Enemy> = new Map();
  private spawnConfigs: Map<string, MobSpawnConfig> = new Map();
  private respawnTimers: Map<string, number> = new Map();
  private lastUpdateTime: number = 0;
  private spawnDistance: number = 400; // Distance from player to spawn mobs (increased for better visibility)
  private despawnDistance: number = 500; // Distance from player to despawn mobs

  constructor() {
    this.initializeSpawnConfigs();
  }

  /**
   * Initialize spawn configurations for all zones
   */
  private initializeSpawnConfigs(): void {
    const zones = ['LOC_HUB_FIGUREIUM', 'LOC_PEACEFUL_FIELDS', 'LOC_SHARDS'];
    
    zones.forEach(zoneId => {
      const config = MobFactory.getZoneSpawnConfig(zoneId);
      if (config) {
        this.spawnConfigs.set(zoneId, config);
      }
    });
  }

  /**
   * Update mob spawning based on player position
   */
  updateMobSpawning(playerPosition: { x: number; y: number }, currentZone: string): MobEvent[] {
    const events: MobEvent[] = [];
    
    // Clear mobs from other zones first (only if beyond despawn distance)
    this.clearMobsFromOtherZones(currentZone, playerPosition);
    
    // Get potential spawn points for ALL zones (not just current zone)
    const allZones = ['LOC_HUB_FIGUREIUM', 'LOC_PEACEFUL_FIELDS', 'LOC_SHARDS'];
    const allSpawnPoints = allZones.flatMap(zone => this.getPotentialSpawnPoints(zone));
    
    // Check which mobs should be spawned from any zone
    allSpawnPoints.forEach(spawnPoint => {
      const distance = this.calculateDistance(playerPosition, spawnPoint.position);
      const spawnPointZone = this.getMobZone(spawnPoint.id);
      // Reduced logging - only log when actually spawning
      // console.log(`MobManager: Checking spawn point ${spawnPoint.id} from zone ${spawnPointZone} at ${spawnPoint.position.x},${spawnPoint.position.y}, distance: ${distance.toFixed(2)}, spawnDistance: ${this.spawnDistance}, alreadySpawned: ${this.mobs.has(spawnPoint.id)}`);
      
      // Spawn if within spawn distance and not already spawned
      if (distance <= this.spawnDistance && !this.mobs.has(spawnPoint.id)) {
        const mob = MobFactory.createMob(
          spawnPoint.id,
          spawnPoint.type,
          spawnPoint.position,
          spawnPoint.level
        );
        
        this.mobs.set(mob.id, mob);
        events.push({
          type: 'SPAWN',
          mobId: mob.id,
          data: { mob }
        });
        console.log(`MobManager: Spawned mob ${mob.id} from zone ${spawnPointZone} at ${mob.position.x},${mob.position.y}`);
      }
    });
    
    // Check which mobs should be despawned
    const mobsToDespawn: string[] = [];
    this.mobs.forEach((mob, mobId) => {
      const distance = this.calculateDistance(playerPosition, mob.position);
      
      // Despawn if too far away
      if (distance > this.despawnDistance) {
        mobsToDespawn.push(mobId);
      }
    });
    
    // Remove distant mobs
    mobsToDespawn.forEach(mobId => {
      this.mobs.delete(mobId);
      this.respawnTimers.delete(mobId);
    });
    
    return events;
  }

  /**
   * Clear mobs from zones other than the current one, but only if they're beyond despawn distance
   */
  private clearMobsFromOtherZones(currentZone: string, playerPosition?: { x: number; y: number }): void {
    const mobsToRemove: string[] = [];
    
    this.mobs.forEach((mob, mobId) => {
      // Check if mob belongs to a different zone
      const mobZone = this.getMobZone(mobId);
      if (mobZone && mobZone !== currentZone) {
        // Only remove if player position is provided and mob is beyond despawn distance
        if (playerPosition) {
          const distance = this.calculateDistance(playerPosition, mob.position);
          if (distance > this.despawnDistance) {
            mobsToRemove.push(mobId);
            console.log(`MobManager: Removing mob ${mobId} from zone ${mobZone} (distance: ${distance.toFixed(2)} > ${this.despawnDistance})`);
          } else {
            // Reduced logging - only log when despawning
            // console.log(`MobManager: Keeping mob ${mobId} from zone ${mobZone} (distance: ${distance.toFixed(2)} <= ${this.despawnDistance})`);
          }
        } else {
          // If no player position, remove all mobs from other zones (fallback)
          mobsToRemove.push(mobId);
        }
      }
    });
    
    // Remove mobs from other zones
    mobsToRemove.forEach(mobId => {
      this.mobs.delete(mobId);
      this.respawnTimers.delete(mobId);
    });
  }

  /**
   * Get the zone for a mob based on its ID
   */
  private getMobZone(mobId: string): string | null {
    if (mobId.startsWith('hub_')) return 'LOC_HUB_FIGUREIUM';
    if (mobId.startsWith('fields_')) return 'LOC_PEACEFUL_FIELDS';
    if (mobId.startsWith('shards_')) return 'LOC_SHARDS';
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
  getMobsInZone(zoneId: string): Enemy[] {
    return Array.from(this.mobs.values()).filter(mob => 
      mob.id.startsWith(zoneId)
    );
  }

  /**
   * Get all active mobs
   */
  getAllMobs(): Enemy[] {
    return Array.from(this.mobs.values());
  }

  /**
   * Get mob by ID
   */
  getMob(mobId: string): Enemy | undefined {
    return this.mobs.get(mobId);
  }

  /**
   * Update mob state (called every frame)
   */
  updateMobs(deltaTime: number, currentTime: number): MobUpdateResult {
    const events: MobEvent[] = [];
    const updatedMobs: Enemy[] = [];

    // Update all mobs
    this.mobs.forEach((mob, mobId) => {
      let updatedMob = mob;

      // Update counterattack window if mob is attacking
      if (mob.isAttacking) {
        updatedMob = mob.updateCounterWindow(deltaTime);
        
        // Check if attack ended
        if (!updatedMob.isAttacking && mob.isAttacking) {
          events.push({
            type: 'ATTACK_END',
            mobId: mobId,
            data: { mob: updatedMob }
          });
        }
      }

      // Check if mob died
      if (!updatedMob.isAlive() && mob.isAlive()) {
        events.push({
          type: 'DEATH',
          mobId: mobId,
          data: { 
            mob: updatedMob,
            xp: updatedMob.getExperienceValue(),
            gold: updatedMob.getGoldValue()
          }
        });

        // Schedule respawn
        this.scheduleRespawn(mobId, updatedMob);
      }

      updatedMobs.push(updatedMob);
      this.mobs.set(mobId, updatedMob);
    });

    // Update respawn timers
    this.updateRespawnTimers(deltaTime, events);

    this.lastUpdateTime = currentTime;

    return {
      mobs: updatedMobs,
      events
    };
  }

  /**
   * Handle mob taking damage
   */
  damageMob(mobId: string, damage: number, isMagical: boolean = false): MobEvent | null {
    const mob = this.mobs.get(mobId);
    if (!mob || !mob.isAlive()) return null;

    const damagedMob = mob.takeDamage(damage, isMagical);
    this.mobs.set(mobId, damagedMob);

    return {
      type: 'DAMAGE',
      mobId: mobId,
      data: { 
        mob: damagedMob,
        damage,
        isMagical
      }
    };
  }

  /**
   * Handle mob starting attack
   */
  startMobAttack(mobId: string, currentTime: number): MobEvent | null {
    const mob = this.mobs.get(mobId);
    if (!mob || !mob.isAlive() || !mob.canAttack(currentTime)) return null;

    const attackingMob = mob.startAttack(currentTime);
    this.mobs.set(mobId, attackingMob);

    return {
      type: 'ATTACK_START',
      mobId: mobId,
      data: { 
        mob: attackingMob,
        counterWindow: attackingMob.counterWindow
      }
    };
  }

  /**
   * Handle counterattack on mob
   */
  counterattackMob(mobId: string, damage: number): MobEvent | null {
    const mob = this.mobs.get(mobId);
    if (!mob || !mob.canBeCounterattacked()) return null;

    const counterattackedMob = mob.takeDamage(damage).endAttack();
    this.mobs.set(mobId, counterattackedMob);

    return {
      type: 'DAMAGE',
      mobId: mobId,
      data: { 
        mob: counterattackedMob,
        damage,
        isCounterattack: true
      }
    };
  }

  /**
   * Get mobs within range of a position
   */
  getMobsInRange(position: EnemyPosition, range: number): Enemy[] {
    return Array.from(this.mobs.values()).filter(mob => 
      mob.isAlive() && mob.getDistanceToPosition(position) <= range
    );
  }

  /**
   * Get mobs that can attack the player
   */
  getAggressiveMobsInRange(position: EnemyPosition, range: number): Enemy[] {
    return this.getMobsInRange(position, range).filter(mob => 
      mob.willAttackPlayer()
    );
  }

  /**
   * Schedule mob respawn
   */
  private scheduleRespawn(mobId: string, deadMob: Enemy): void {
    const zoneId = mobId.split('_')[0] + '_' + mobId.split('_')[1];
    const config = this.spawnConfigs.get(zoneId);
    
    if (config && config.respawnTime > 0) {
      this.respawnTimers.set(mobId, config.respawnTime);
    }
  }

  /**
   * Update respawn timers and spawn mobs when ready
   */
  private updateRespawnTimers(deltaTime: number, events: MobEvent[]): void {
    this.respawnTimers.forEach((timeLeft, mobId) => {
      const newTimeLeft = timeLeft - deltaTime;
      
      if (newTimeLeft <= 0) {
        // Respawn mob
        const zoneId = mobId.split('_')[0] + '_' + mobId.split('_')[1];
        const originalMob = this.mobs.get(mobId);
        
        if (originalMob) {
          // Create new mob at original position
          const newMob = MobFactory.createMob(
            mobId,
            originalMob.type,
            originalMob.position,
            1 // TODO: Scale level based on player progress
          );
          
          this.mobs.set(mobId, newMob);
          this.respawnTimers.delete(mobId);
          
          events.push({
            type: 'SPAWN',
            mobId: mobId,
            data: { mob: newMob }
          });
        }
      } else {
        this.respawnTimers.set(mobId, newTimeLeft);
      }
    });
  }

  /**
   * Clear all mobs (for zone transitions)
   */
  clearMobs(): void {
    this.mobs.clear();
    this.respawnTimers.clear();
  }

  /**
   * Clear mobs in specific zone
   */
  clearZoneMobs(zoneId: string): void {
    const mobsToRemove = Array.from(this.mobs.keys()).filter(id => 
      id.startsWith(zoneId)
    );
    
    mobsToRemove.forEach(id => {
      this.mobs.delete(id);
      this.respawnTimers.delete(id);
    });
  }
}
