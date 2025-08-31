/**
 * Domain Value Object: Spell
 * Immutable representation of a spell with all its properties
 */

export interface SpellEffect {
  readonly type: 'damage' | 'heal' | 'damage+slow' | 'shield';
  readonly amount: number;
  readonly duration?: number; // For effects that last over time
}

export class Spell {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _pattern: string;
  private readonly _level: number;
  private readonly _manaCost: number;
  private readonly _castTime: number;
  private readonly _effect: SpellEffect;
  private readonly _description: string;

  constructor(
    id: string,
    name: string,
    pattern: string,
    level: number,
    manaCost: number,
    castTime: number,
    effect: SpellEffect,
    description: string = ''
  ) {
    if (level < 1) throw new Error('Spell level must be at least 1');
    if (manaCost < 0) throw new Error('Mana cost cannot be negative');
    if (castTime < 0) throw new Error('Cast time cannot be negative');
    if (effect.amount < 0) throw new Error('Spell effect amount cannot be negative');

    this._id = id;
    this._name = name;
    this._pattern = pattern;
    this._level = level;
    this._manaCost = manaCost;
    this._castTime = castTime;
    this._effect = effect;
    this._description = description;
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get pattern(): string { return this._pattern; }
  get level(): number { return this._level; }
  get manaCost(): number { return this._manaCost; }
  get castTime(): number { return this._castTime; }
  get effect(): SpellEffect { return this._effect; }
  get description(): string { return this._description; }

  // Value object methods
  equals(other: Spell): boolean {
    return this._id === other._id &&
           this._name === other._name &&
           this._pattern === other._pattern &&
           this._level === other._level &&
           this._manaCost === other._manaCost &&
           this._castTime === other._castTime &&
           this.effectEquals(this._effect, other._effect);
  }

  // Domain Operations
  withAccuracyModifier(accuracy: number): Spell {
    // Accuracy affects spell power: ±20% based on accuracy (0.6-1.0 range)
    const powerModifier = 1 + (accuracy - 1) * 0.2;
    const modifiedAmount = Math.floor(this._effect.amount * powerModifier);
    
    const modifiedEffect: SpellEffect = {
      ...this._effect,
      amount: Math.max(1, modifiedAmount) // Minimum 1 damage/effect
    };

    return new Spell(
      this._id,
      this._name,
      this._pattern,
      this._level,
      this._manaCost,
      this._castTime,
      modifiedEffect,
      this._description
    );
  }

  withCastSpeedModifier(castSpeed: number): number {
    return this._castTime / Math.max(0.1, castSpeed); // Minimum 0.1x speed
  }

  // Domain Rules
  canBeCastByLevel(playerLevel: number): boolean {
    return playerLevel >= this._level;
  }

  isDamageSpell(): boolean {
    return this._effect.type === 'damage' || this._effect.type === 'damage+slow';
  }

  isHealingSpell(): boolean {
    return this._effect.type === 'heal';
  }

  hasTemporalEffect(): boolean {
    return this._effect.duration !== undefined && this._effect.duration > 0;
  }

  private effectEquals(effect1: SpellEffect, effect2: SpellEffect): boolean {
    return effect1.type === effect2.type &&
           effect1.amount === effect2.amount &&
           effect1.duration === effect2.duration;
  }

  toString(): string {
    return `${this._name} (Level ${this._level}, ${this._manaCost} Mana)`;
  }
}