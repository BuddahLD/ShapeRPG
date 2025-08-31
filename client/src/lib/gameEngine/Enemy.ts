import { Enemy as DomainEnemy, EnemyStats, EnemyPosition } from "../../domain/entities/Enemy";

export class Enemy {
  private _id: string;
  private _type: string;
  private _position: EnemyPosition;
  private _stats: EnemyStats;
  private _isAttacking: boolean;
  private _counterWindow: number;
  private _lastAttackTime: number;
  private readonly _attackCooldown: number;
  private readonly _attackWindowDuration: number;

  constructor(
    id: string,
    type: string,
    position: EnemyPosition = { x: 0, y: 0 },
    stats: EnemyStats = {
      hp: 30,
      maxHp: 30,
      attack: 3,
      defense: 1,
      size: 20
    },
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
  get type(): string { return this._type; }
  get position(): EnemyPosition { return this._position; }
  get stats(): EnemyStats { return this._stats; }
  get isAttacking(): boolean { return this._isAttacking; }
  get counterWindow(): number { return this._counterWindow; }
  get lastAttackTime(): number { return this._lastAttackTime; }
  get attackCooldown(): number { return this._attackCooldown; }

  // Compatibility getters for old game engine
  get x(): number { return this._position.x; }
  get y(): number { return this._position.y; }
  get hp(): number { return this._stats.hp; }
  get maxHp(): number { return this._stats.maxHp; }
  get atk(): number { return this._stats.attack; }
  get def(): number { return this._stats.defense; }
  get size(): number { return this._stats.size; }

  // Domain Operations
  moveTo(newPosition: EnemyPosition): Enemy {
    const newEnemy = this.clone();
    newEnemy._position = newPosition;
    return newEnemy;
  }

  takeDamage(damage: number): number {
    const actualDamage = Math.max(1, damage - this._stats.defense);
    const newHp = Math.max(0, this._stats.hp - actualDamage);
    
    this._stats = {
      ...this._stats,
      hp: newHp
    };

    return actualDamage;
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

  canAttack(currentTime: number): boolean {
    return currentTime - this._lastAttackTime >= this._attackCooldown;
  }

  update(deltaTime: number): void {
    // Update counter window
    if (this._counterWindow > 0) {
      this._counterWindow = Math.max(0, this._counterWindow - deltaTime);
      if (this._counterWindow === 0) {
        this._isAttacking = false;
      }
    }
  }

  // Domain Rules
  isAlive(): boolean {
    return this._stats.hp > 0;
  }

  canBeCounterattacked(): boolean {
    return this._isAttacking && this._counterWindow > 0;
  }

  getExperienceValue(): number {
    // Base XP based on enemy type
    switch (this._type) {
      case 'TRI_SMALL': return 10;
      case 'TRI_MEDIUM': return 20;
      case 'TRI_ELITE': return 50;
      case 'HEX_PEACEFUL': return 5;
      default: return 15;
    }
  }

  getGoldValue(): number {
    // Base gold based on enemy type
    switch (this._type) {
      case 'TRI_SMALL': return 5 + Math.floor(Math.random() * 6); // 5-10
      case 'TRI_MEDIUM': return 10 + Math.floor(Math.random() * 11); // 10-20
      case 'TRI_ELITE': return 20 + Math.floor(Math.random() * 21); // 20-40
      case 'HEX_PEACEFUL': return 2 + Math.floor(Math.random() * 4); // 2-5
      default: return 8 + Math.floor(Math.random() * 8); // 8-15
    }
  }

  // Private helper methods
  private clone(): Enemy {
    return new Enemy(
      this._id,
      this._type,
      this._position,
      this._stats,
      this._attackCooldown,
      this._attackWindowDuration
    );
  }
}
