/**
 * Domain Entity: Player
 * Core business logic for player character - no external dependencies
 */

export interface PlayerStats {
  readonly hp: number;
  readonly maxHp: number;
  readonly mana: number;
  readonly maxMana: number;
  readonly attack: number;
  readonly defense: number;
  readonly castSpeed: number;
}

export interface PlayerPosition {
  readonly x: number;
  readonly y: number;
}

export class Player {
  private readonly _id: string;
  private _position: PlayerPosition;
  private _stats: PlayerStats;
  private _level: number;
  private _experience: number;
  private _gold: number;
  private _knownSpells: ReadonlySet<string>;

  constructor(
    id: string,
    position: PlayerPosition,
    stats: PlayerStats,
    level: number = 1,
    experience: number = 0,
    gold: number = 0,
    knownSpells: string[] = []
  ) {
    this._id = id;
    this._position = position;
    this._stats = stats;
    this._level = level;
    this._experience = experience;
    this._gold = gold;
    this._knownSpells = new Set(knownSpells);
  }

  // Getters
  get id(): string { return this._id; }
  get position(): PlayerPosition { return this._position; }
  get stats(): PlayerStats { return this._stats; }
  get level(): number { return this._level; }
  get experience(): number { return this._experience; }
  get gold(): number { return this._gold; }
  get knownSpells(): ReadonlySet<string> { return this._knownSpells; }

  // Domain Operations
  moveTo(newPosition: PlayerPosition): Player {
    return new Player(
      this._id,
      newPosition,
      this._stats,
      this._level,
      this._experience,
      this._gold,
      Array.from(this._knownSpells)
    );
  }

  takeDamage(damage: number): Player {
    const actualDamage = Math.max(1, damage - this._stats.defense);
    const newHp = Math.max(0, this._stats.hp - actualDamage);
    
    const newStats: PlayerStats = {
      ...this._stats,
      hp: newHp
    };

    return new Player(
      this._id,
      this._position,
      newStats,
      this._level,
      this._experience,
      this._gold,
      Array.from(this._knownSpells)
    );
  }

  heal(amount: number): Player {
    const newHp = Math.min(this._stats.maxHp, this._stats.hp + amount);
    const newStats: PlayerStats = {
      ...this._stats,
      hp: newHp
    };

    return new Player(
      this._id,
      this._position,
      newStats,
      this._level,
      this._experience,
      this._gold,
      Array.from(this._knownSpells)
    );
  }

  useMana(amount: number): { success: boolean; player: Player } {
    if (this._stats.mana < amount) {
      return { success: false, player: this };
    }

    const newStats: PlayerStats = {
      ...this._stats,
      mana: this._stats.mana - amount
    };

    const newPlayer = new Player(
      this._id,
      this._position,
      newStats,
      this._level,
      this._experience,
      this._gold,
      Array.from(this._knownSpells)
    );

    return { success: true, player: newPlayer };
  }

  addExperience(amount: number): { leveledUp: boolean; player: Player } {
    const newExperience = this._experience + amount;
    const experienceRequired = this.getExperienceRequired(this._level);
    
    if (newExperience >= experienceRequired) {
      // Level up
      const newLevel = this._level + 1;
      const remainingExperience = newExperience - experienceRequired;
      
      // Stat bonuses on level up
      const newStats: PlayerStats = {
        hp: Math.min(this._stats.maxHp, this._stats.hp + 10), // Heal on level up
        maxHp: this._stats.maxHp + 10,
        mana: Math.min(this._stats.maxMana, this._stats.mana + 5), // Restore mana on level up  
        maxMana: this._stats.maxMana + 5,
        attack: this._stats.attack + 1,
        defense: this._stats.defense + 1,
        castSpeed: this._stats.castSpeed
      };

      const newPlayer = new Player(
        this._id,
        this._position,
        newStats,
        newLevel,
        remainingExperience,
        this._gold,
        Array.from(this._knownSpells)
      );

      return { leveledUp: true, player: newPlayer };
    }

    const newPlayer = new Player(
      this._id,
      this._position,
      this._stats,
      this._level,
      newExperience,
      this._gold,
      Array.from(this._knownSpells)
    );

    return { leveledUp: false, player: newPlayer };
  }

  addGold(amount: number): Player {
    return new Player(
      this._id,
      this._position,
      this._stats,
      this._level,
      this._experience,
      this._gold + amount,
      Array.from(this._knownSpells)
    );
  }

  learnSpell(spellId: string): Player {
    if (this._knownSpells.has(spellId)) {
      return this; // Already known
    }

    const newSpells = new Set(this._knownSpells);
    newSpells.add(spellId);

    return new Player(
      this._id,
      this._position,
      this._stats,
      this._level,
      this._experience,
      this._gold,
      Array.from(newSpells)
    );
  }

  // Domain Rules
  isAlive(): boolean {
    return this._stats.hp > 0;
  }

  canCastSpell(spellId: string, manaCost: number): boolean {
    return this._knownSpells.has(spellId) && this._stats.mana >= manaCost;
  }

  getExperienceRequired(level: number): number {
    return 100 * Math.pow(level, 2);
  }

  getExperienceProgress(): number {
    const required = this.getExperienceRequired(this._level);
    return required > 0 ? this._experience / required : 1;
  }
}