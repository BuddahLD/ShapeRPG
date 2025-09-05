# Enemy Spawn System Documentation

## Overview

The Enemy Spawn System manages the creation, persistence, and cleanup of enemy entities in the game world. It implements a distance-based spawning system that allows enemies to persist across zone boundaries while maintaining performance and memory efficiency.

## Architecture

### Clean Architecture Implementation

- **Domain Layer**: `Enemy` entities, `EnemyFactory`, spawn point definitions
- **Application Layer**: `EnemyManager` service, spawn logic, distance calculations
- **Infrastructure Layer**: Enemy persistence, event handling
- **Presentation Layer**: `EnemyRenderer` component, visual rendering

### Key Components

- **EnemyManager**: Core service managing enemy lifecycle
- **EnemyFactory**: Creates enemy instances with proper stats
- **EnemyRenderer**: Renders enemies on screen with proper coordinates
- **Spawn Points**: Predefined enemy locations per zone

## Spawn System Design

### Distance-Based Spawning

The system uses distance-based spawning rather than zone-based spawning for more natural gameplay:

- **Spawn Distance**: 400 units (enemies spawn when player is within 400 units)
- **Despawn Distance**: 500 units (enemies despawn when player is more than 500 units away)
- **Cross-Zone Persistence**: Enemies persist across zone boundaries if within despawn distance

### Spawn Points Configuration

Each zone has predefined spawn points with specific enemy types and positions:

#### Hub (LOC_HUB_FIGUREIUM)
- **Dummy**: 1 enemy at (-150, 150) - bottom left corner
- **Purpose**: Training target for players

#### Peaceful Fields (LOC_PEACEFUL_FIELDS)
- **Hexagon Peaceful**: 5 enemies scattered throughout fields area
- **Positions**: (300, 50), (400, -50), (500, 0), (350, 100), (450, -100)
- **Behavior**: Peaceful until attacked

#### Shards (LOC_SHARDS)
- **Triangle Small**: 4 enemies at level 2
- **Triangle Aggressive**: 1 enemy at level 3
- **Positions**: (700, 100), (800, -100), (900, 200), (750, -200), (1000, 0)
- **Behavior**: Neutral and aggressive respectively

### Enemy Types and Stats

Based on Joe's game balance design:

- **DUMMY**: Training target, no threat
- **HEX_PEACEFUL**: Green hexagons, peaceful behavior
- **TRI_SMALL**: Orange triangles, neutral behavior
- **TRI_AGGRESSIVE**: Red triangles, aggressive behavior

## Implementation Details

### Spawn Logic Flow

1. **Distance Check**: Calculate distance from player to all spawn points
2. **Spawn Decision**: Spawn enemies within spawn distance (400 units)
3. **Cross-Zone Spawning**: Check spawn points from ALL zones, not just current zone
4. **Persistence Check**: Keep enemies from other zones if within despawn distance (500 units)
5. **Cleanup**: Remove enemies beyond despawn distance

### Performance Optimizations

- **Periodic Checks**: Spawn checks every 100ms (10 times per second)
- **Distance Caching**: Store last spawn check position to avoid redundant calculations
- **Efficient Cleanup**: Only remove enemies beyond despawn distance
- **Event-Driven Updates**: Use React useEffect for position-based updates

### Coordinate System

- **World Coordinates**: Enemy positions in world space
- **Screen Coordinates**: Converted for rendering relative to player position
- **Consistent Rendering**: Uses same coordinate system as NPCs and other world objects

## Configuration

### Spawn Distances

```typescript
private spawnDistance: number = 400;    // Units from player to spawn enemies
private despawnDistance: number = 500;  // Units from player to despawn enemies
```

### Render Distances

```typescript
// Extended render distance: screen + 50% on each side
const renderMarginX = window.innerWidth * 0.5;   // 50% of screen width
const renderMarginY = window.innerHeight * 0.5;  // 50% of screen height
```

### Update Frequencies

- **Spawn Checks**: 100ms intervals (10 times per second)
- **Enemy Updates**: 60fps (16ms intervals)
- **Position Updates**: Every frame when player moves

## Event System

### Spawn Events

- **SPAWN**: Enemy spawned at position
- **DESPAWN**: Enemy removed from world
- **DEATH**: Enemy defeated by player
- **ATTACK_START**: Enemy begins attack
- **ATTACK_END**: Enemy finishes attack

### Event Handling

Events are processed by the `EnemyRenderer` component and can trigger:
- Visual effects
- Sound effects
- UI updates
- Achievement triggers

## Debugging and Monitoring

### Console Logging

The system provides detailed logging for debugging:

- **Spawn Checks**: When and why enemies are spawned
- **Distance Calculations**: Exact distances for spawn decisions
- **Zone Information**: Which zone each enemy belongs to
- **Cleanup Decisions**: Why enemies are kept or removed

### Debug Overlay

Visual debug information displayed in-game:
- Player position (world coordinates)
- Current zone
- Local position (rendering coordinates)

## Future Enhancements

### Planned Features

- **Respawn System**: Enemies respawn after being defeated
- **Dynamic Spawning**: Spawn enemies based on player level and progress
- **Spawn Density**: Configurable enemy density per zone
- **Spawn Triggers**: Event-based spawning (e.g., quest completion)

### Performance Improvements

- **Spatial Partitioning**: Optimize distance calculations for large worlds
- **LOD System**: Level of detail for distant enemies
- **Memory Pooling**: Reuse enemy objects to reduce garbage collection
- **Async Spawning**: Load enemy data asynchronously

## Team Responsibilities

### Mark (Tech Team Lead)
- Architecture review and performance optimization
- Clean architecture compliance
- System scalability and maintainability

### Ron (Senior Developer)
- Implementation details and code quality
- Performance monitoring and optimization
- Integration with other game systems

### Joe (Game Designer)
- Spawn point placement and enemy distribution
- Balance tuning for spawn distances
- Gameplay experience and pacing

### Frank (Level Designer)
- Zone-specific spawn point design
- Enemy placement for optimal gameplay flow
- Encounter design and difficulty curves

## Testing

### Unit Tests

- Distance calculation accuracy
- Spawn point validation
- Event system functionality
- Memory cleanup verification

### Integration Tests

- Cross-zone enemy persistence
- Performance under load
- Memory usage patterns
- Rendering accuracy

### Manual Testing

- Visual verification of enemy spawning
- Distance-based persistence testing
- Zone transition behavior
- Performance monitoring

## Troubleshooting

### Common Issues

1. **Enemies Not Spawning**: Check spawn distance and player position
2. **Enemies Disappearing**: Verify despawn distance settings
3. **Performance Issues**: Monitor spawn check frequency and enemy count
4. **Rendering Issues**: Check coordinate conversion and render distance

### Debug Steps

1. Check console logs for spawn events
2. Verify player position in debug overlay
3. Monitor enemy count and distance calculations
4. Test zone transitions and persistence

---

*Last Updated: Current Implementation*
*Reviewed By: Mark (Tech Team Lead), Ron (Senior Developer)*
