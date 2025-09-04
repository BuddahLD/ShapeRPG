/**
 * Domain Entity: Enemy
 * Core business logic for enemy entities - no external dependencies
 */

export interface EnemyStats {
  readonly hp: number;
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly magicResist: number;
  readonly size: number;
}

export interface EnemyPosition {
  readonly x: number;
  readonly y: number;
}

export type EnemyType = 'DUMMY' | 'HEX_PEACEFUL' | 'TRI_SMALL' | 'TRI_AGGRESSIVE' | 'TRI_MEDIUM' | 'TRI_ELITE';

export type EnemyBehavior = 'PEACEFUL' | 'NEUTRAL' | 'AGGRESSIVE';

export class Enemy {
  private readonly _id: string;
  private readonly _type: EnemyType;
  private readonly _behavior: EnemyBehavior;
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
    behavior: EnemyBehavior,
    position: EnemyPosition,
    stats: EnemyStats,
    attackCooldown: number = 2000,
    attackWindowDuration: number = 1000
  ) {
    this._id = id;
    this._type = type;
    this._behavior = behavior;
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
  get behavior(): EnemyBehavior { return this._behavior; }
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

  takeDamage(damage: number, isMagical: boolean = false): Enemy {
    const resistance = isMagical ? this._stats.magicResist : this._stats.defense;
    const actualDamage = Math.max(1, damage - resistance);
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
      'DUMMY': 0.0,
      'HEX_PEACEFUL': 1.0,
      'TRI_SMALL': 1.0,
      'TRI_AGGRESSIVE': 1.2,
      'TRI_MEDIUM': 1.5,
      'TRI_ELITE': 2.0
    };
    
    return Math.floor(baseExp * (typeMultipliers[this._type] || 1.0));
  }

  getGoldValue(): number {
    const goldRanges: Record<EnemyType, [number, number]> = {
      'DUMMY': [0, 0],
      'HEX_PEACEFUL': [2, 5],
      'TRI_SMALL': [8, 12],
      'TRI_AGGRESSIVE': [12, 18],
      'TRI_MEDIUM': [18, 25],
      'TRI_ELITE': [35, 50]
    };
    
    const range = goldRanges[this._type] || [1, 5];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }

  // Behavior checks
  isPeaceful(): boolean {
    return this._behavior === 'PEACEFUL';
  }

  isNeutral(): boolean {
    return this._behavior === 'NEUTRAL';
  }

  isAggressive(): boolean {
    return this._behavior === 'AGGRESSIVE';
  }

  willAttackPlayer(): boolean {
    return this._behavior === 'AGGRESSIVE';
  }

  willRetaliate(): boolean {
    return this._behavior === 'NEUTRAL' || this._behavior === 'AGGRESSIVE';
  }

  private clone(): Enemy {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    return cloned;
  }
}