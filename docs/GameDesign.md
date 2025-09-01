# Game Design Document (GDD)
## Shapes RPG: Figureium

### Game Overview
Shapes RPG: Figureium is a minimalist 2D RPG where players control a square hero, casting spells by drawing runes. It features real-time combat, gesture-based magic, counterattack timing, and seamless world exploration. Developed as a full-stack web application with a mobile-first design, it targets iPhone touch controls and combines an iOS-inspired minimalist aesthetic with cartoon-like contours. The project aims to provide an immersive geometric adventure across distinct zones.

### Project Vision
**Vision**: Мінімалістична RPG з геометричними фігурами, де герой-квадрат використовує магію рун (free-draw) та контратаки у реальному часі.

**Elevator Pitch**: Гравець — квадрат, який вчиться малювати руни, щоб кастувати закляття. Помилки при малюванні ведуть до непередбачуваних дебафів. Прогресія — через досвід, книги заклять і покупки у хабі Фігуріум.

### Core Game Loop
1. **Вийти з хабу → бій на арені**
2. **Малювати руни → касти → контратаки**
3. **Отримати XP/Gold/Books**
4. **Повернутися до хабу → купівлі/тренування → наступна спроба**

### Art Style & Platform
- **Art Style**: Геометричні фігури з градієнтами, чистий HUD
- **Platform First**: iPhone (сенсорне керування), згодом — desktop
- **AI Context**: Пріоритет — простий для реалізації MVP з чіткими інтерфейсами для масштабування

## Core Gameplay Mechanics

### Character System
- **Player Character**: Square hero with geometric design
- **Starting Stats** (Level 1):
  - HP: 100, Mana: 50, ATK: 5, DEF: 2, Cast Speed: 1.0
- **Movement**: Seamless world exploration with chunk-based loading
- **Progression**: Player stats, inventory, and character development

### Combat System
- **Real-time Combat**: Dynamic battle mechanics with timing-based elements
- **Counterattack Timing**: Strategic combat requiring precise timing
  - Indicator: Shrinking red ring
  - Base window: 1000ms (scales per enemy via enemy.attackWindow)
  - Success: Counter strike (damage to attacker)
  - Failure: Player takes damage
- **Gesture-based Magic**: Spell casting through rune drawing
- **Shape Matching**: Rune recognition system for spell activation

### Magic & Spells System

#### Spell Casting Sequence
1. **Phase 1 - Drawing**: Hold → fade + global slow-mo (player immobile)
2. **Phase 2 - Release**: Cast start (cast time depends on Cast Speed & spell)
3. **Phase 3 - Targeting**: Short slow-mo tail; player taps target until cast end (else self)
4. **Phase 4 - Resolution**: Apply effect based on accuracy & requirements

#### Accuracy & Learning Rules
- **Matching Method**: Shape similarity (contour-based)
- **Accuracy Effect**: Scales spell power ±20%
- **Unknown Pattern Rules**:
  - If similar to existing pattern and requirements met → learn & cast
  - If similar but requirements NOT met → debuff
  - If no similarity → random debuff from pool

#### Available Spells
- **SPL01 - Fire Bolt**: Line pattern, Level 1, 5 mana, 1000ms cast, 10 damage
- **SPL02 - Ice Shard**: Zigzag pattern, Level 2, 8 mana, 1200ms cast, 8 damage + 2s slow
- **SPL03 - Shield Aura**: Circle pattern, Level 3, 12 mana, 1500ms cast, +5 DEF for 10s
- **SPL04 - Dark Mist**: Wave pattern, Level 4, 15 mana, 2000ms cast, 3s blackout for enemies

#### Debuff Pool Examples
- **Self Damage**: 5 damage to player
- **Slow Player**: 0.5x speed for 2 seconds
- **Screen Blackout**: 2 seconds of darkness
- **Weakness**: 0.001x ATK for 3 seconds

### World & Exploration
- **Seamless Transitions**: Smooth movement between zones
- **Chunk-based Loading**: Dynamic 400x400 unit chunk loading/unloading
- **Zone System**: Distinct areas (Hub, Peaceful Fields, Arena)
- **Performance Optimization**: Efficient world rendering and exploration

### Enemy AI & Content
- **Zone-specific Behaviors**: Different enemy types per area
- **AI Patterns**: Intelligent enemy movement and combat responses

#### Arena 1 Enemies
- **TRI_SMALL**: Triangle, 30 HP, 3 ATK, 1 DEF, 10 XP, 5-10 Gold, 5% book drop, 1000ms attack window
- **TRI_MEDIUM**: Triangle, 60 HP, 6 ATK, 2 DEF, 20 XP, 10-20 Gold, 7% book drop, 900ms attack window
- **TRI_ELITE**: Triangle, 120 HP, 10 ATK, 3 DEF, 50 XP, 20-40 Gold, 12% book drop, 800ms attack window

## User Experience Design

### Mobile Touch Controls
- **Movement**: Virtual joystick at bottom center (≈25% screen height)
  - Note: Joystick inactive during drawing
- **Magic**: Bottom right rune circle
  - Tap and hold to free-draw
  - Phases: Hold → fade on + global slow-mo + free-draw
  - Release → fade off + short slow-mo tail → cast start
  - Target tap allowed until cast end; if none → self-target
- **Counterattack**: Tap anywhere during shrinking red circle (1000ms window)
- **UI Elements**:
  - Top bar: HP, Mana
  - Bottom bar: XP, Level
  - Notifications: New Book/Spell discovered

### Design Features
- **Mobile-First Design**: Optimized for iPhone touch controls
- **Touch Controls**: Virtual joystick, gesture recognition, dedicated touch zones
- **Responsive Design**: Adapts to different screen sizes
- **Intuitive Interface**: Easy-to-use controls and navigation

## Progression & Economy

### Experience System
- **XP Formula**: XP required(level) = 100 * (level²)
- **Level Up Points**: 1 assignable stat point per level
- **Assignable Stats**: ATK, DEF, HP, Mana, Cast Speed

### Economy System
- **Currency**: Gold
- **Shop Access**: Any item can be bought if enough gold (no level requirement)

### Available Equipment

#### Weapons
- **WPN01 - Wooden Wand**: 3 ATK, 50 Gold
- **WPN02 - Iron Staff**: 6 ATK, 120 Gold
- **WPN03 - Crystal Rod**: 10 ATK, 5 Mana, 250 Gold

#### Armor
- **ARM01 - Cloth Robe**: 2 DEF, 40 Gold
- **ARM02 - Leather Coat**: 5 DEF, 100 Gold
- **ARM03 - Magic Cloak**: 8 DEF, 20 HP, 220 Gold

### Loot & Progression
- **Gold Range**: Per enemy
- **Book Drop**: Low chance per enemy (5–12%)
- **Books Unlock**: Reveal rune pattern + requirements; if requirements met → spell usable

## Game Locations & NPCs

### Locations
- **LOC_HUB_FIGUREIUM - Фігуріум**: Hub (safe zone)
  - NPCs: Weapon Shop, Armor Shop, Trainer
  - Notes: Minimal interaction menu; return point after battles
- **LOC_ARENA_1 - Арена #1**: Combat zone
  - Enemies: TRI_SMALL, TRI_MEDIUM, TRI_ELITE

### NPCs
- **NPC_SHOP_WEAPONS**: Weapon shop with inventory [WPN01, WPN02, WPN03]
- **NPC_SHOP_ARMOR**: Armor shop with inventory [ARM01, ARM02, ARM03]
- **NPC_TRAINER**: Trainer offering services [teach spells, upgrade time slow]
  - Teaches spell IDs: [SPL02, SPL03, SPL04]

## Technical Game Features
- **60fps Game Loop**: Smooth, responsive gameplay
- **Time-scaled Updates**: Delta-time animations and logic
- **Slow-motion Effects**: Enhanced rune drawing experience
- **Event-driven Combat**: Dynamic battle system

## Visual Design
- **iOS-Inspired Minimalism**: Clean, modern interface following 2025 design trends
- **Cartoon Contours**: Prince of Persia 2008-style outline rendering
- **Geometric Aesthetics**: Square-based character and world design
- **Pastel Color Palette**: Sophisticated color schemes with authentic gradients
- **Glassmorphism Effects**: Modern UI elements with depth
- **Smooth Animations**: Cubic-bezier easing for natural motion

## Target Platform
- **Primary**: iPhone (touch-optimized)
- **Secondary**: Web browsers (responsive design)
- **Input Method**: Touch gestures and virtual controls

## Game Zones
1. **Hub (Фігуріум)**: Central area for character management, shopping, and training
2. **Arena #1**: Combat-focused area with challenging triangle enemies
3. **Future Zones**: Additional areas planned for expansion

## Future Expansion
- Additional zones and areas
- More spell types and rune patterns
- Enhanced enemy AI and behaviors
- Character customization options
- Multiplayer features
- Boss encounters and quests
- Advanced spell learning systems

## Technical Implementation Notes

### AI Context for Development
- **Priority**: Simple MVP implementation with clear interfaces for scaling
- **Main Focus**: Rune drawing system (shape matching), counterattack with timing window, and basic economy
- **Important**: During drawing - global slow-mo and disabled movement; after release - short window for target selection

### Formulas
- **XP Required**: 100 * (level²)
- **Accuracy Power Scale**: Final power = base * (1 ± 0.2) depending on accuracy
- **Counter Window**: Per enemy.attackWindow (ms)
