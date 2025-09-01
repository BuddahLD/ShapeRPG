interface Spell {
  id: string;
  name: string;
  pattern: string;
  level: number;
  mana: number;
  castTime: number;
  effect: any;
  type: string;
}

export class SpellSystem {
  private activeSpells: Map<string, any> = new Map();
  private knownSpells: Map<string, Spell> = new Map();

  constructor() {
    // Initialize with basic spells
    this.initializeSpells();
  }

  public update(deltaTime: number): void {
    // Update active spell casting timers
    this.activeSpells.forEach((spell, id) => {
      spell.castTime -= deltaTime;
      
      if (spell.castTime <= 0) {
        this.completeCast(id, spell);
      }
    });
  }

  public startCast(spellId: string, caster: any, accuracy: number = 1.0): boolean {
    const spell = this.knownSpells.get(spellId);
    if (!spell) {
      console.log(`Unknown spell: ${spellId}`);
      return false;
    }

    // Check mana cost
    if (caster.stats && caster.stats.mana < spell.mana) {
      console.log(`Not enough mana to cast ${spell.name}`);
      return false;
    }

    // Consume mana
    if (caster.stats) {
      caster.stats.mana -= spell.mana;
    }

    // Calculate cast time based on cast speed
    const baseCastTime = spell.castTime;
    const castSpeed = caster.stats?.castSpeed || 1.0;
    const actualCastTime = baseCastTime / castSpeed;

    // Store active cast
    const castId = `cast_${Date.now()}`;
    this.activeSpells.set(castId, {
      spell: spell,
      caster: caster,
      accuracy: accuracy,
      castTime: actualCastTime,
      originalCastTime: actualCastTime
    });

    console.log(`Started casting ${spell.name} (${actualCastTime}ms)`);
    return true;
  }

  public learnSpell(spellData: Spell): void {
    this.knownSpells.set(spellData.id, spellData);
    console.log(`Learned spell: ${spellData.name}`);
  }

  public getKnownSpells(): Spell[] {
    return Array.from(this.knownSpells.values());
  }

  public hasSpell(spellId: string): boolean {
    return this.knownSpells.has(spellId);
  }

  private completeCast(castId: string, castData: any): void {
    const { spell, caster, accuracy } = castData;
    
    // Apply accuracy modifier to spell power
    const powerModifier = 1 + (accuracy - 1) * 0.2; // ±20% based on accuracy
    const modifiedSpell = {
      ...spell,
      effect: {
        ...spell.effect,
        amount: spell.effect.amount ? Math.floor(spell.effect.amount * powerModifier) : undefined,
        damage: spell.effect.damage ? Math.floor(spell.effect.damage * powerModifier) : undefined
      }
    };

    console.log(`Cast completed: ${spell.name} with ${(powerModifier * 100).toFixed(0)}% power`);
    
    // Remove from active spells
    this.activeSpells.delete(castId);
    
    // Apply spell effect
    this.applySpellEffect(modifiedSpell, caster);
  }

  private applySpellEffect(spell: Spell, caster: any): void {
    // Apply spell effects based on type
    switch (spell.type) {
      case "attack":
        // This would target enemies in range
        console.log(`Attack spell ${spell.name} completed`);
        break;
      case "buff":
        // Apply buff to caster
        console.log(`Buff spell ${spell.name} applied to caster`);
        break;
      case "debuff":
        // Apply debuff to enemies
        console.log(`Debuff spell ${spell.name} applied to enemies`);
        break;
      default:
        console.log(`Unknown spell type: ${spell.type}`);
    }
  }

  private initializeSpells(): void {
    // Initialize with basic spells from GDD
    const basicSpells: Spell[] = [
      {
        id: "SPL01",
        name: "Fire Bolt",
        pattern: "line",
        level: 1,
        mana: 5,
        castTime: 1000,
        effect: { type: "damage", amount: 10 },
        type: "attack"
      },
      {
        id: "SPL02",
        name: "Ice Shard",
        pattern: "zigzag",
        level: 2,
        mana: 8,
        castTime: 1200,
        effect: { type: "damage+slow", damage: 8, slowSeconds: 2 },
        type: "attack"
      },
      {
        id: "SPL03",
        name: "Shield Aura",
        pattern: "circle",
        level: 3,
        mana: 12,
        castTime: 1500,
        effect: { type: "buff", defPlus: 5, durationSec: 10 },
        type: "buff"
      },
      {
        id: "SPL04",
        name: "Dark Mist",
        pattern: "wave",
        level: 4,
        mana: 15,
        castTime: 2000,
        effect: { type: "blackout", target: "enemies", durationSec: 3 },
        type: "debuff"
      }
    ];

    basicSpells.forEach(spell => {
      this.knownSpells.set(spell.id, spell);
    });

    console.log(`Initialized ${basicSpells.length} basic spells`);
  }
}
