# Game Balance Documentation
## Joe's Design Notes - Shapes RPG: Figureium

### Game Designer: Joe "BalanceMaster" Chen
**Experience**: 15+ years in RPG design, specializing in progression systems and combat balance
**Philosophy**: "Every number tells a story. Every stat should feel meaningful."

---

## Platform Focus: PC/Windows (Keyboard & Mouse)

### Input Method Transition
- **Primary**: Keyboard & Mouse (PC/Windows)
- **Secondary**: Touch (Mobile - future consideration)
- **Current**: Browser-based game with PC optimization

### PC-Specific Design Considerations
- **Precision**: Mouse allows for precise targeting and spell casting
- **Speed**: Keyboard shortcuts for quick actions
- **Combat Timing**: Counterattack windows can be tighter due to faster reaction times
- **UI Density**: More information can be displayed on larger screens
- **Input Complexity**: Multiple simultaneous inputs (WASD + mouse + keyboard shortcuts)

---

## Core Game Progression Philosophy

### Game Length & Structure
- **Target Duration**: 20-40 hours of meaningful gameplay
- **Story-Driven**: Clear beginning, middle, and end
- **Progression Curve**: Steady power growth with meaningful choices
- **Endgame**: Final boss encounter, not endless grinding

### Player Power Fantasy
- **Early Game**: Learning basic mechanics, simple encounters
- **Mid Game**: Strategic combat, meaningful equipment choices
- **Late Game**: Mastery of systems, challenging boss encounters
- **End Game**: Epic final confrontation with all systems mastered

---

## Player Stats System

### Base Stats (Level 1)
```typescript
interface PlayerStats {
  // Core Combat Stats
  HP: 100;           // Health Points
  MaxHP: 100;        // Maximum Health
  Mana: 50;          // Magic Energy
  MaxMana: 50;       // Maximum Mana
  
  // Offensive Stats
  ATK: 8;            // Physical Attack Power
  MagicPower: 10;    // Magical Attack Power
  
  // Defensive Stats
  DEF: 3;            // Physical Defense
  MagicResist: 2;    // Magical Defense
  
  // Utility Stats
  CastSpeed: 1.0;    // Spell Casting Speed Multiplier
  MovementSpeed: 1.0; // Movement Speed Multiplier
  CritChance: 0.05;  // 5% Critical Hit Chance
  CritMultiplier: 1.5; // 150% Critical Damage
}
```

### Stat Growth Per Level
- **HP**: +15 per level (linear growth)
- **Mana**: +8 per level (linear growth)
- **ATK**: +2 per level (linear growth)
- **MagicPower**: +2.5 per level (linear growth)
- **DEF**: +1 per level (linear growth)
- **MagicResist**: +0.8 per level (linear growth)
- **CastSpeed**: +0.05 per level (diminishing returns)
- **MovementSpeed**: +0.02 per level (diminishing returns)
- **CritChance**: +0.005 per level (5% at level 10, 10% at level 20)
- **CritMultiplier**: +0.02 per level (1.7x at level 10, 2.0x at level 20)

### Level Cap & Progression
- **Maximum Level**: 25 (story completion)
- **XP Formula**: `XP_Required(level) = 100 * (level²)`
- **Stat Points**: 1 assignable point per level (25 total)
- **Assignable Stats**: ATK, MagicPower, DEF, MagicResist, CastSpeed, MovementSpeed

---

## Enemy Scaling System

### Enemy Level Ranges by Zone
- **Hub (Peaceful)**: Level 1-3 (tutorial/peaceful)
- **Shards Area**: Level 2-5 (early combat)
- **Arena 1**: Level 4-8 (mid-game)
- **Future Zones**: Level 6-15 (late game)
- **Final Boss**: Level 20 (epic encounter)

### Enemy Stat Scaling Formula
```typescript
interface EnemyStats {
  level: number;
  HP: number;
  ATK: number;
  DEF: number;
  MagicResist: number;
  AttackWindow: number; // Counterattack window in ms
  XP: number;
  Gold: number;
}

// Scaling Formulas
const enemyHP = (baseHP: number, level: number) => baseHP * (1 + (level - 1) * 0.8);
const enemyATK = (baseATK: number, level: number) => baseATK * (1 + (level - 1) * 0.6);
const enemyDEF = (baseDEF: number, level: number) => baseDEF * (1 + (level - 1) * 0.4);
const enemyMagicResist = (baseResist: number, level: number) => baseResist * (1 + (level - 1) * 0.3);
```

### Enemy Types & Base Stats

#### DUMMY (Training Target)
- **Base Level**: 1
- **Base Stats**: HP: 50, ATK: 0, DEF: 0, MagicResist: 0
- **Attack Window**: N/A (never attacks)
- **XP**: 0, Gold: 0
- **Behavior**: Training dummy (never attacks, can be attacked for practice)
- **Spawn Location**: Hub (1 enemy)

#### HEX_PEACEFUL (Hexagon - Peaceful)
- **Base Level**: 1
- **Base Stats**: HP: 15, ATK: 0, DEF: 0, MagicResist: 0
- **Attack Window**: N/A (never attacks)
- **XP**: 5, Gold: 2-5
- **Behavior**: Peaceful (never attacks, can be attacked)
- **Spawn Location**: Peaceful Fields (a few enemies)

#### TRI_SMALL (Triangle - Neutral)
- **Base Level**: 2
- **Base Stats**: HP: 25, ATK: 4, DEF: 1, MagicResist: 0
- **Attack Window**: 2000ms (2 seconds)
- **XP**: 15, Gold: 8-12
- **Behavior**: Neutral (attacks only when attacked)
- **Spawn Location**: Shards Area (2 enemies)

#### TRI_AGGRESSIVE (Triangle - Aggressive)
- **Base Level**: 3
- **Base Stats**: HP: 35, ATK: 6, DEF: 2, MagicResist: 1
- **Attack Window**: 1800ms (1.8 seconds)
- **XP**: 25, Gold: 12-18
- **Behavior**: Aggressive (attacks on sight)
- **Spawn Location**: Shards Area - Top Right (1 enemy)

#### TRI_MEDIUM (Triangle - Medium) [Future]
- **Base Level**: 4
- **Base Stats**: HP: 45, ATK: 7, DEF: 2, MagicResist: 1
- **Attack Window**: 1500ms (1.5 seconds)
- **XP**: 35, Gold: 18-25
- **Behavior**: Neutral (attacks only when attacked)

#### TRI_ELITE (Triangle - Hard) [Future]
- **Base Level**: 6
- **Base Stats**: HP: 80, ATK: 12, DEF: 4, MagicResist: 2
- **Attack Window**: 1000ms (1 second)
- **XP**: 75, Gold: 35-50
- **Behavior**: Aggressive (attacks on sight)

---

## Combat Balance

### Damage Calculation
```typescript
// Physical Damage
const physicalDamage = Math.max(1, attacker.ATK - defender.DEF);

// Magical Damage
const magicalDamage = Math.max(1, attacker.MagicPower - defender.MagicResist);

// Critical Hit
const isCrit = Math.random() < attacker.CritChance;
const finalDamage = isCrit ? damage * attacker.CritMultiplier : damage;
```

### Counterattack System Balance
- **Base Counterattack Damage**: 150% of normal attack
- **Timing Bonus**: Up to 50% additional damage for perfect timing
- **Maximum Counterattack Damage**: 200% of normal attack
- **Counterattack Success**: Cancels enemy attack, deals bonus damage
- **Counterattack Failure**: Player takes normal damage

### Spell Balance
- **Mana Cost**: Scales with spell power and level
- **Cast Time**: Affected by player CastSpeed stat
- **Damage**: Scales with MagicPower stat
- **Accuracy**: Affects damage by ±20% based on rune drawing precision

---

## Equipment System (Future Implementation)

### Equipment Tiers
- **Tier 1 (Levels 1-5)**: Basic equipment, small stat bonuses
- **Tier 2 (Levels 6-10)**: Improved equipment, moderate stat bonuses
- **Tier 3 (Levels 11-15)**: Advanced equipment, significant stat bonuses
- **Tier 4 (Levels 16-20)**: Elite equipment, major stat bonuses
- **Tier 5 (Levels 21-25)**: Legendary equipment, massive stat bonuses

### Equipment Balance Philosophy
- **Shop Items**: Reliable, predictable stats, always available
- **Enemy Drops**: Random stats, potentially better than shop items
- **Unique Items**: Special effects, not just stat bonuses
- **Progression**: Each tier should feel significantly better than the previous

---

## Zone Progression Balance

### Shards Area (Initial Combat Zone)
- **Enemy Count**: 5 TRI_SMALL enemies
- **Enemy Level**: 2-3 (scaled)
- **Difficulty**: Easy (learning combat mechanics)
- **Rewards**: Basic XP and gold, introduction to combat
- **Player Level**: 1-3 (appropriate for this zone)

### Arena 1 (Mid-Game Zone)
- **Enemy Count**: 3-4 enemies (mixed types)
- **Enemy Level**: 4-6 (scaled)
- **Difficulty**: Medium (strategic combat)
- **Rewards**: Better XP and gold, equipment drops
- **Player Level**: 3-6 (appropriate for this zone)

---

## Joe's Design Notes

### Combat Philosophy
- **Quality over Quantity**: Focus on meaningful, strategic encounters
- **Player Agency**: Every action should feel impactful
- **Learning Curve**: Gradual introduction of complexity
- **Mastery**: Late-game encounters should test all learned skills

### Balance Principles
- **No Trivial Encounters**: Every fight should require some thought
- **No Impossible Encounters**: Every fight should be winnable with skill
- **Meaningful Choices**: Equipment and stat allocation should matter
- **Clear Feedback**: Players should understand why they won or lost

### Progression Design
- **Steady Growth**: Player power should increase consistently
- **Meaningful Milestones**: Level-ups should feel significant
- **Strategic Depth**: Higher levels should unlock new strategies
- **Endgame Satisfaction**: Final encounters should feel epic

---

## Implementation Priorities

### Phase 1: Core Balance (MVP)
- [ ] Implement basic player stats system
- [ ] Create TRI_SMALL enemies for Shards area
- [ ] Implement basic combat damage calculation
- [ ] Add counterattack system with timing windows

### Phase 2: Progression Balance
- [ ] Implement level-up system with stat allocation
- [ ] Add equipment system with stat bonuses
- [ ] Create zone-based enemy scaling
- [ ] Implement XP and gold rewards

### Phase 3: Advanced Balance
- [ ] Add critical hit system
- [ ] Implement spell damage scaling
- [ ] Create equipment tiers and rarity
- [ ] Add status effects and debuffs

### Phase 4: Polish & Tuning
- [ ] Balance testing and adjustment
- [ ] Add combat feedback and visual effects
- [ ] Implement difficulty scaling options
- [ ] Create balance testing tools

---

## Team Decisions & Implementation Plan

### Technical Implementation ✅
1. **Performance**: 50 enemies maximum for smooth 60fps
2. **Save System**: Currently no save system. Will add save functionality later
3. **Difficulty**: One balanced experience with non-linear location difficulty progression

### Gameplay Design ✅
1. **Death Penalty**: Game over - start from level 0 if no saved games. Encourages careful play and save management
2. **Equipment Durability**: No degradation/break system - equipment is permanent
3. **Spell Learning**: 
   - Extract spells from fallen enemies (success rate depends on player intelligence, mind read skill, mob level, spell level)
   - Find spells in chests (TBD mechanic)
   - Get spells from quests (TBD mechanic)
   - Spell view popup with "play" button showing drawing path

### Content Creation ✅
1. **Enemy Variety**: 3 types per zone initially
   - **Hub**: 1 dummy (training type)
   - **Peaceful Fields**: A few peaceful mobs
   - **Shards Area**: 1 aggressive mob (top right), 2 neutral mobs
2. **Boss Encounters**: 60-70% gear-based, 30-40% skill-based
   - High counterattack success rate
   - Correct spell usage (elemental resistance awareness)
   - Skillful timing and avoidance
   - Possible to win with low gear + high skill, or lose with top gear + no skill
3. **Side Content**: Yes, quests/challenges will be implemented as separate system (separate documentation)

### Progression Philosophy ✅
- **Non-linear Difficulty**: Locations get harder but you can farm any location indefinitely
- **Playstyle Flexibility**: 
  - "Accumulate Power" strategy: Stay on one location, then sprint through next 2-3
  - "Slow Progress" strategy: Gradually move through each location
  - Both strategies should be viable and fun

---

## Balance Testing Checklist

### Early Game (Levels 1-5)
- [ ] Player can defeat TRI_SMALL enemies without excessive difficulty
- [ ] Counterattack timing feels fair and learnable
- [ ] Spell casting is responsive and satisfying
- [ ] Progression feels meaningful

### Mid Game (Levels 6-15)
- [ ] Player can handle mixed enemy encounters
- [ ] Equipment choices feel impactful
- [ ] Spell combinations are effective
- [ ] Challenge increases appropriately

### Late Game (Levels 16-25)
- [ ] Player has mastered all systems
- [ ] Final encounters are challenging but fair
- [ ] All equipment and spells are useful
- [ ] Victory feels earned and satisfying

---

*"Remember: Good balance isn't about making everything equal. It's about making everything feel right."* - Joe "BalanceMaster" Chen
