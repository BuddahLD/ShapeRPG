/**
 * Domain Entity: Enemy
 * Core business logic for enemy entities - no external dependencies
 */

export interface EnemyStats {
  readonly hp: number;
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly size: number;
}

export interface EnemyPosition {
  readonly x: number;
  readonly y: number;
}

export type EnemyType = 'HEX_PEACEFUL' | 'TRI_ARENA' | 'TRI_SMALL' | 'TRI_MEDIUM' | 'TRI_ELITE';

export class Enemy {
  private readonly _id: string;
  private readonly _type: EnemyType;
  private _position: EnemyPosition;
  private _stats: EnemyStats;
  private _isAttacking: boolean;
  private _counterWindow: number;
  private _lastAttackTime: number;
  private readonly _attackCooldown: number;
  private readonly _attackWindowDuration: number;

  constructor(
    id: string,
    type: EnemyType,
    position: EnemyPosition,
    stats: EnemyStats,
    attackCooldown: number = 2000,
    attackWindowDuration: number = 1000
  ) {
    this._id = id;
    this._type = type;
    this._position = position;
    this._stats = stats;
    this._isAttacking = false;
    this._counterWindow = 0;
    this._lastAttackTime = 0;
    this._attackCooldown = attackCooldown;
    this._attackWindowDuration = attackWindowDuration;
  }

  // Getters
  get id(): string { return this._id; }
  get type(): EnemyType { return this._type; }
  get position(): EnemyPosition { return this._position; }
  get stats(): EnemyStats { return this._stats; }
  get isAttacking(): boolean { return this._isAttacking; }
  get counterWindow(): number { return this._counterWindow; }
  get lastAttackTime(): number { return this._lastAttackTime; }
  get attackCooldown(): number { return this._attackCooldown; }

  // Domain Operations
  moveTo(newPosition: EnemyPosition): Enemy {
    const newEnemy = this.clone();
    newEnemy._position = newPosition;
    return newEnemy;
  }

  takeDamage(damage: number): Enemy {
    const actualDamage = Math.max(1, damage - this._stats.defense);
    const newHp = Math.max(0, this._stats.hp - actualDamage);
    
    const newEnemy = this.clone();
    newEnemy._stats = {
      ...this._stats,
      hp: newHp
    };

    return newEnemy;
  }

  startAttack(currentTime: number): Enemy {
    const newEnemy = this.clone();
    newEnemy._isAttacking = true;
    newEnemy._counterWindow = this._attackWindowDuration;
    newEnemy._lastAttackTime = currentTime;
    return newEnemy;
  }

  updateCounterWindow(deltaTime: number): Enemy {
    if (this._counterWindow <= 0) {
      return this;
    }

    const newCounterWindow = Math.max(0, this._counterWindow - deltaTime);
    const newEnemy = this.clone();
    newEnemy._counterWindow = newCounterWindow;
    
    if (newCounterWindow === 0) {
      newEnemy._isAttacking = false;
    }

    return newEnemy;
  }

  endAttack(): Enemy {
    const newEnemy = this.clone();
    newEnemy._isAttacking = false;
    newEnemy._counterWindow = 0;
    return newEnemy;
  }

  // Domain Rules
  isAlive(): boolean {
    return this._stats.hp > 0;
  }

  canAttack(currentTime: number): boolean {
    return !this._isAttacking && 
           (currentTime - this._lastAttackTime) > this._attackCooldown;
  }

  canBeCounterattacked(): boolean {
    return this._isAttacking && this._counterWindow > 0;
  }

  getDistanceToPosition(position: EnemyPosition): number {
    const dx = this._position.x - position.x;
    const dy = this._position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getExperienceValue(): number {
    const baseExp = this._stats.maxHp / 10;
    const typeMultipliers: Record<EnemyType, number> = {
      'HEX_PEACEFUL': 1.0,
      'TRI_ARENA': 1.2,
      'TRI_SMALL': 1.0,
      'TRI_MEDIUM': 1.5,
      'TRI_ELITE': 2.0
    };
    
    return Math.floor(baseExp * (typeMultipliers[this._type] || 1.0));
  }

  getGoldValue(): number {
    const goldRanges: Record<EnemyType, [number, number]> = {
      'HEX_PEACEFUL': [2, 5],
      'TRI_ARENA': [5, 10],
      'TRI_SMALL': [5, 10],
      'TRI_MEDIUM': [10, 20],
      'TRI_ELITE': [20, 40]
    };
    
    const range = goldRanges[this._type] || [1, 5];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }

  private clone(): Enemy {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    return cloned;
  }
}