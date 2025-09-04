# Combat System Documentation

## Overview
The combat system in Shapes RPG: Figureium implements real-time tactical combat with gesture-based magic, counterattack mechanics, and intelligent enemy AI. The system focuses on timing-based interactions, strategic spell casting, and dynamic enemy behaviors across different zones.

**Platform Focus**: PC/Windows (Keyboard & Mouse) - Browser-based game optimized for desktop gameplay.

**Balance Design**: See [GameBalance.md](./GameBalance.md) for detailed balance notes by Joe "BalanceMaster" Chen.

## Core Combat Mechanics

### Combat Flow
1. **Encounter Detection**: Player enters enemy visibility range or attacks enemy
2. **Initiative Phase**: Determine attack order based on enemy type and player actions
3. **Action Phase**: Execute attacks, spells, and counterattacks
4. **Resolution Phase**: Apply damage, effects, and status changes
5. **Cleanup Phase**: Handle death, loot drops, and experience gain

### Real-time Combat Features
- **Timing-based Counterattacks**: Strategic combat requiring precise timing
- **Gesture-based Magic**: Spell casting through rune drawing (see existing system)
- **Dynamic Enemy AI**: Different behaviors based on enemy type and situation
- **Zone-specific Encounters**: Enemies spawn only in their designated areas

## Enemy System Architecture

### Enemy Types

#### 1. Peaceful Enemies
- **Behavior**: Never attack player under any circumstances
- **Interaction**: Can be attacked by player, will not retaliate
- **Examples**: HEX_PEACEFUL (hexagonal creatures in peaceful areas)
- **Use Case**: Resource gathering, practice targets, environmental creatures

#### 2. Neutral Enemies
- **Behavior**: Passive until attacked, then becomes aggressive
- **Interaction**: Will attack player only after being attacked first
- **Examples**: TRI_SMALL, TRI_MEDIUM (triangle creatures in shards area)
- **Use Case**: Balanced combat encounters, risk/reward decisions

#### 3. Aggressive Enemies
- **Behavior**: Attack player immediately when in visibility range
- **Interaction**: Proactive combat engagement
- **Examples**: TRI_ELITE, future boss enemies
- **Use Case**: Challenging encounters, area denial mechanics

### Attack Types

#### Melee Attacks
- **Range**: Close proximity to player
- **Animation**: Direct contact attack
- **Counterattack Window**: Standard timing (1000ms base)
- **Damage**: Physical damage based on enemy ATK stat

#### Ranged Attacks
- **Range**: Medium distance from player
- **Animation**: Projectile or beam attack
- **Counterattack Window**: Slightly longer (1200ms base)
- **Damage**: Physical damage with potential for area effects

#### Magic Attacks
- **Range**: Variable (close to long range)
- **Animation**: Spell effects and visual indicators
- **Counterattack Window**: Variable based on spell complexity
- **Damage**: Magical damage with potential status effects

## Enemy Movement System

### Movement Interface Architecture
```typescript
interface IMovementBehavior {
  update(deltaTime: number, playerPosition: Position): Position;
  canMove(): boolean;
  getMovementSpeed(): number;
  setTarget(target: Position): void;
}
```

### Movement Implementations

#### 1. Static Movement
- **Behavior**: Enemy remains stationary
- **Use Case**: Turret-style enemies, stationary guards
- **Implementation**: No position updates, only rotation/targeting

#### 2. Linear Path Movement
- **Behavior**: Enemy moves along predefined waypoints
- **Use Case**: Patrol routes, simple AI patterns
- **Implementation**: Waypoint-based movement with loop/reverse options

#### 3. AI-based Movement (Future)
- **Behavior**: Dynamic movement based on conditions
- **Use Case**: Advanced enemy behaviors, adaptive AI
- **Implementation**: State machine with decision trees
- **TODO**: Implement after basic movement systems are complete

### Follow System
- **Trigger**: Enemy enters combat with player
- **Behavior**: Enemy follows player across zone boundaries
- **Timeout**: TODO - Implement follow timeout to prevent infinite chasing
- **Limitations**: Follow range, zone restrictions, leash mechanics

## Enemy Spawning System

### Zone-based Spawning
- **Location**: Enemies spawn only in designated zones
- **Persistence**: Enemies remain in world until defeated
- **Respawn**: TODO - Implement respawn mechanics for cleared areas
- **Density**: Configurable enemy density per zone

### Initial Implementation: Shards Area
- **Enemy Count**: 5 neutral melee enemies
- **Enemy Type**: TRI_SMALL (easy difficulty)
- **Spawn Pattern**: Scattered throughout shards area
- **Behavior**: Neutral until attacked, then aggressive

## Enemy Stats and Equipment

### Stat System
Enemies use the same stat system as players:
- **HP**: Health points
- **MaxHP**: Maximum health
- **ATK**: Attack power
- **DEF**: Defense rating
- **Size**: Physical size for collision and rendering

### Equipment System
- **Weapons**: Melee weapons, ranged weapons, magical implements
- **Armor**: Defensive equipment affecting DEF stat
- **Accessories**: Special items with unique effects
- **Durability**: TODO - Consider equipment durability system

### Loot System
When enemies die (0 HP), they drop:
- **Weapons**: Equipped weapons
- **Armor**: Equipped armor pieces
- **Items**: Consumables, materials, special items
- **Gold**: Currency based on enemy level and type
- **Experience**: XP for player progression

## Counterattack System

### Counterattack Mechanics
- **Trigger**: Enemy begins attack animation
- **Indicator**: Shrinking circle indicator appears
- **Window**: Time window for player response (scales with enemy level/skills)
- **Success**: Player deals bonus damage and cancels enemy attack
- **Failure**: Player takes normal damage from enemy attack

### Timing Windows
- **Easy Enemies**: 2000ms (2 seconds) - TRI_SMALL
- **Medium Enemies**: 1500ms (1.5 seconds) - TRI_MEDIUM  
- **Hard Enemies**: 1000ms (1 second) - TRI_ELITE
- **Boss Enemies**: 800ms (0.8 seconds) - Future implementation

### Counterattack Formula
```typescript
// Base counterattack damage
const baseDamage = player.ATK * 1.5; // 50% bonus damage

// Timing bonus (faster counter = more damage)
const timingBonus = Math.max(0, (windowRemaining / totalWindow) * 0.5);
const finalDamage = baseDamage * (1 + timingBonus);
```

### Visual Indicators
- **Circle Indicator**: Red shrinking circle around enemy
- **Timing Feedback**: Visual feedback for successful/failed counterattacks
- **Damage Numbers**: Floating damage text for counterattack damage

## Player Attack System Integration

### Rune Drawing System (Existing)
The player attack system is already documented in GameDesign.md:

#### Spell Casting Sequence
1. **Phase 1 - Drawing**: Hold rune button → fade + global slow-mo (player immobile)
2. **Phase 2 - Release**: Cast start (cast time depends on Cast Speed & spell)
3. **Phase 3 - Targeting**: Short slow-mo tail; player taps target until cast end
4. **Phase 4 - Resolution**: Apply effect based on accuracy & requirements

#### Available Spells
- **SPL01 - Fire Bolt**: Line pattern, 10 damage, 1000ms cast
- **SPL02 - Ice Shard**: Zigzag pattern, 8 damage + 2s slow, 1200ms cast
- **SPL03 - Shield Aura**: Circle pattern, +5 DEF for 10s, 1500ms cast
- **SPL04 - Dark Mist**: Wave pattern, 3s blackout for enemies, 2000ms cast

### Combat Integration
- **Targeting**: Player can target enemies during spell casting
- **Interruption**: Enemy attacks can interrupt player spell casting
- **Mana Cost**: Spells consume mana, limiting spell usage
- **Cooldowns**: TODO - Consider spell cooldown system

## Implementation Phases

### Phase 1: Basic Enemy System (MVP)
- [ ] Create enemy entity system with stats (based on Joe's balance formulas)
- [ ] Implement TRI_SMALL enemies (neutral, level 2-3) for shards area
- [ ] Add static movement behavior (no equipment system yet)
- [ ] Create enemy spawning system for shards area (5 enemies)
- [ ] Implement basic combat damage calculation (ATK vs DEF, MagicPower vs MagicResist)
- [ ] Add PC controls (WASD movement, mouse targeting)

### Phase 2: Combat Mechanics
- [ ] Implement counterattack system with timing windows (2s for TRI_SMALL)
- [ ] Add visual indicators for counterattack opportunities (shrinking red circle)
- [ ] Create enemy attack animations and effects
- [ ] Integrate player spell casting with enemy targeting (manual targeting only)
- [ ] Add combat state management
- [ ] Implement keyboard shortcuts (Space for counterattack, Tab for target cycling)

### Phase 3: Advanced Features
- [ ] Implement loot drop system (gold, XP, no equipment yet)
- [ ] Add enemy equipment and weapon systems (future - Joe will design)
- [ ] Create enemy AI state machines
- [ ] Implement follow system with timeout mechanics (TODO: pathfinding algorithm needed)
- [ ] Add enemy respawn mechanics
- [ ] Add TRI_MEDIUM and TRI_ELITE enemies for Arena 1

### Phase 4: Polish and Optimization
- [ ] Add combat sound effects
- [ ] Implement combat animations and visual effects
- [ ] Optimize performance for desktop browsers (quality over quantity approach)
- [ ] Add combat statistics and damage numbers
- [ ] Create combat tutorial system
- [ ] Add critical hit system and status effects

## Technical Architecture

### Clean Architecture Implementation
- **Domain Layer**: Enemy entities, combat rules, stat calculations
- **Application Layer**: Combat use cases, enemy AI logic, spawn management
- **Infrastructure Layer**: Enemy repositories, combat event handling
- **Presentation Layer**: Combat UI, enemy rendering, input handling

### Key Components
- **EnemyManager**: Manages enemy instances and behaviors
- **CombatService**: Handles combat calculations and state
- **SpawnService**: Manages enemy spawning and respawning
- **MovementService**: Handles enemy movement behaviors
- **LootService**: Manages item drops and rewards

### Event System
- **Combat Events**: Attack, damage, death, counterattack
- **Enemy Events**: Spawn, despawn, state changes
- **Player Events**: Spell cast, counterattack attempt
- **UI Events**: Combat indicators, damage numbers

## PC/Windows Controls

### Input Methods
- **Movement**: WASD keys for player movement
  - Note: Movement disabled during spell drawing
- **Magic**: Right-click and hold to free-draw runes
  - Phases: Hold → fade on + global slow-mo + free-draw
  - Release → fade off + short slow-mo tail → cast start
  - Left-click target allowed until cast end; if none → self-target
- **Counterattack**: Left-click anywhere during shrinking red circle (timing window varies by enemy)
- **UI Elements**:
  - Top bar: HP, Mana
  - Bottom bar: XP, Level
  - Notifications: New Book/Spell discovered
- **Keyboard Shortcuts**: 
  - Space: Quick counterattack (when available)
  - Tab: Cycle through available targets
  - 1-4: Quick spell selection (future feature)

### PC-Specific Design Considerations
- **Precision**: Mouse allows for precise targeting and spell casting
- **Speed**: Keyboard shortcuts for quick actions
- **Combat Timing**: Counterattack windows can be tighter due to faster reaction times
- **UI Density**: More information can be displayed on larger screens
- **Input Complexity**: Multiple simultaneous inputs (WASD + mouse + keyboard shortcuts)

## Open Questions for Implementation

### Combat Balance (Answered by Joe's Balance Doc)
- ✅ Enemy scaling: See GameBalance.md for detailed formulas
- ✅ Counterattack windows: 2s (easy), 1.5s (medium), 1s (hard)
- ✅ Spell damage scaling: Based on MagicPower vs MagicResist

### AI Behavior
- Should enemies have different attack patterns (combo attacks, special moves)?
- How should enemy AI adapt to player behavior over time?
- What's the optimal follow distance and timeout for chasing? (TODO: Implement follow system later)

### Performance (PC Focus)
- How many enemies can be active simultaneously? (Focus on quality over quantity)
- Should enemies have LOD (Level of Detail) for distant enemies?
- How should combat calculations be optimized for desktop browsers?

### Progression (Answered by Joe's Balance Doc)
- ✅ Enemy scaling: Fixed levels per zone, not dynamic scaling
- ✅ Loot quality: Scales with enemy level and type
- ✅ Experience curve: 100 * (level²) formula

### Technical Implementation
- Should combat be server-authoritative or client-side?
- How should combat state be synchronized in multiplayer?
- What's the best approach for combat replay/recording?

## Integration with Existing Systems

### Minimap Integration
- Enemies appear as red dots on minimap when in range
- Enemy positions update in real-time
- Different enemy types have different visual indicators

### Zone System Integration
- Enemies respect zone boundaries
- Different zones have different enemy types
- Zone transitions affect enemy behavior

### Player System Integration
- Combat affects player stats (HP, mana consumption)
- Experience gain from defeating enemies
- Equipment affects combat effectiveness

### Spell System Integration
- Player spells can target enemies
- Enemy magic resistance affects spell damage
- Spell effects can influence enemy behavior

## Future Enhancements

### Advanced Combat Features
- Combo attacks and special moves
- Environmental interactions (destructible objects)
- Status effects and debuffs
- Critical hits and damage multipliers

### Enemy AI Improvements
- Group tactics and coordination
- Adaptive AI that learns from player behavior
- Dynamic difficulty adjustment
- Boss encounters with multiple phases

### Combat Modes
- Turn-based combat option
- Real-time strategy elements
- Cooperative multiplayer combat
- PvP combat system

This documentation provides a comprehensive foundation for implementing the combat system while maintaining clean architecture principles and ensuring scalability for future enhancements.
