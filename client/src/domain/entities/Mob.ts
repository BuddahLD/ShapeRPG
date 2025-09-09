/**
 * Domain Entity: Mob
 * Core business logic for mob entities - no external dependencies
 */

import { MovementState } from '../services/DummyMovementService';

export interface MobStats {
  readonly hp: number;
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly magicResist: number;
  readonly size: number;
}

export interface MobPosition {
  readonly x: number;
  readonly y: number;
}

export type MobType = 'DUMMY' | 'HEX_PEACEFUL' | 'TRI_SMALL' | 'TRI_AGGRESSIVE' | 'TRI_MEDIUM' | 'TRI_ELITE';

export type MobBehavior = 'PEACEFUL' | 'NEUTRAL' | 'AGGRESSIVE';

export class Mob {
  private readonly _id: string;
  private readonly _type: MobType;
  private readonly _behavior: MobBehavior;
  private _position: MobPosition;
  private _stats: MobStats;
  private _isAttacking: boolean;
  private _counterWindow: number;
  private _lastAttackTime: number;
  private readonly _attackCooldown: number;
  private readonly _attackWindowDuration: number;
  private _movementState: MovementState | null;

  constructor(
    id: string,
    type: MobType,
    behavior: MobBehavior,
    position: MobPosition,
    stats: MobStats,
    attackCooldown: number = 2000,
    attackWindowDuration: number = 1000,
    movementState: MovementState | null = null
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
    this._movementState = movementState;
  }

  // Getters
  get id(): string { return this._id; }
  get type(): MobType { return this._type; }
  get behavior(): MobBehavior { return this._behavior; }
  get position(): MobPosition { return this._position; }
  get stats(): MobStats { return this._stats; }
  get isAttacking(): boolean { return this._isAttacking; }
  get counterWindow(): number { return this._counterWindow; }
  get lastAttackTime(): number { return this._lastAttackTime; }
  get attackCooldown(): number { return this._attackCooldown; }
  get movementState(): MovementState | null { return this._movementState; }

  // Domain Operations
  moveTo(newPosition: MobPosition): Mob {
    const newMob = this.clone();
    newMob._position = newPosition;
    return newMob;
  }

  takeDamage(damage: number, isMagical: boolean = false): Mob {
    const resistance = isMagical ? this._stats.magicResist : this._stats.defense;
    const actualDamage = Math.max(1, damage - resistance);
    const newHp = Math.max(0, this._stats.hp - actualDamage);
    
    const newMob = this.clone();
    newMob._stats = {
      ...this._stats,
      hp: newHp
    };

    return newMob;
  }

  startAttack(currentTime: number): Mob {
    const newMob = this.clone();
    newMob._isAttacking = true;
    newMob._counterWindow = this._attackWindowDuration;
    newMob._lastAttackTime = currentTime;
    return newMob;
  }

  updateCounterWindow(deltaTime: number): Mob {
    if (this._counterWindow <= 0) {
      return this;
    }

    const newCounterWindow = Math.max(0, this._counterWindow - deltaTime);
    const newMob = this.clone();
    newMob._counterWindow = newCounterWindow;
    
    if (newCounterWindow === 0) {
      newMob._isAttacking = false;
    }

    return newMob;
  }

  endAttack(): Mob {
    const newMob = this.clone();
    newMob._isAttacking = false;
    newMob._counterWindow = 0;
    return newMob;
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

  getDistanceToPosition(position: MobPosition): number {
    const dx = this._position.x - position.x;
    const dy = this._position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getExperienceValue(): number {
    const baseExp = this._stats.maxHp / 10;
    const typeMultipliers: Record<MobType, number> = {
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
    const goldRanges: Record<MobType, [number, number]> = {
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

  // Movement-related methods
  hasMovementBehavior(): boolean {
    return this._movementState !== null;
  }

  isDummy(): boolean {
    return this._type === 'DUMMY';
  }

  updateMovementState(newState: MovementState): Mob {
    const newMob = this.clone();
    newMob._movementState = newState;
    return newMob;
  }

  clearMovementState(): Mob {
    const newMob = this.clone();
    newMob._movementState = null;
    return newMob;
  }

  private clone(): Mob {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    // Deep clone the movement state if it exists
    if (this._movementState) {
      cloned._movementState = { ...this._movementState };
    }
    return cloned;
  }
}