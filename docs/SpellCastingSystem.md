# Spell Casting System

## Overview
The spell casting system allows players to cast spells by drawing patterns and provides visual feedback during the casting process.

## How It Works

### 1. Drawing Phase
- Player holds the rune button to start drawing
- Player draws a pattern on screen (triangle, circle, etc.)
- System analyzes the drawn pattern for accuracy

### 2. Cast Animation Phase
- **Immediate Start**: Cast animation begins immediately after drawing completion
- **Visual Feedback**: Cyan circle appears around rune button with burn-down effect
- **Particle Effects**: Sparks and particles animate during cast
- **Direction Targeting**: Player can tap anywhere on screen to set spell direction
- **Self-Cast**: If no direction is set, spell targets the player

### 3. Spell Resolution
- Spell is cast in the chosen direction
- Accuracy affects spell effectiveness
- Mana is consumed based on spell requirements

## Spell Patterns

### Current Implemented Patterns
- **Triangle** → Fire Bolt (SPL01)
  - Cast Time: 3.0 seconds
  - Mana Cost: 5
  - Damage: 10

### Planned Patterns
- **Zigzag** → Ice Shard (SPL02)
- **Circle** → Shield Aura (SPL03)  
- **Wave** → Dark Mist (SPL04)

## Technical Implementation

### Components
- `RuneDrawing.tsx` - Main drawing interface
- `CastAnimation.tsx` - Cast animation with particles
- `ShapeMatchingService.ts` - Pattern recognition
- `SpellPreview.tsx` - Spell pattern preview in inventory

### Key Features
- **KISS Principle**: Simple but elegant implementation
- **Non-Breaking**: Existing rune drawing logic preserved
- **Mobile-First**: Touch-optimized interactions
- **Visual Polish**: Smooth animations and particle effects

## Cast Animation Details

### Visual Elements
- **Circle**: 2px thick cyan border around rune button
- **Burn Effect**: Counter-clockwise progress indicator
- **Particles**: Spark effects during casting
- **Direction Indicator**: Cyan dot shows chosen direction

### Interaction
- **Touch/Mouse**: Tap anywhere during cast to set direction
- **No Input**: Spell targets player (self-cast)
- **Visual Feedback**: Clear indication of chosen direction

## Future Enhancements
- Additional spell patterns (zigzag, circle, wave)
- Animated pattern previews
- Spell combination system
- Advanced particle effects
- Sound effects integration
