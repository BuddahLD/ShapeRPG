# Minimap System Documentation

## Overview
The minimap system has been redesigned to show a local area around the player instead of the entire world. This provides better navigation and follows modern game design principles. The system is built with clean architecture and is prepared for future big map implementation.

## Architecture

### Clean Architecture Implementation
- **Domain Layer**: `IMapService` interface defines contracts
- **Application Layer**: `MinimapService` implements business logic
- **Infrastructure Layer**: Uses `IWorldRepository` for data access
- **Presentation Layer**: `Minimap` component handles UI rendering

### Key Components

#### 1. IMapService Interface (`domain/interfaces/services/IMapService.ts`)
Defines the contract for all map-related services:
- `getMapData()` - Get map data for current position
- `worldToMap()` - Convert world coordinates to map coordinates
- `getMapEntities()` - Get entities to display on map
- `getAvailableZoomLevels()` - Get zoom levels for big map
- `calculateViewBounds()` - Calculate view bounds for zoom level

#### 2. MinimapService (`application/services/MinimapService.ts`)
Implements the map service interface:
- **Local Area View**: Shows 200 units around player (configurable)
- **Dynamic Zone Detection**: Only renders visible zones
- **Entity Management**: Handles player, enemies, NPCs, items
- **Zoom Support**: Prepared for multiple zoom levels
- **Performance Optimized**: Only processes visible areas

#### 3. Minimap Component (`components/Minimap.tsx`)
React component for minimap rendering:
- **52x52 pixel display** (matches HP/MP container height)
- **Real-time updates** based on player position
- **Zone backgrounds** with proper colors and boundaries
- **Entity rendering** (player, enemies, etc.)
- **Responsive design** following project's design system

## Features

### Current Implementation
- **Local Area View**: Shows 200 units around player
- **Zone Visualization**: Displays Hub, Fields, Shards, and Nowhere zones
- **Dynamic Boundaries**: Only shows boundaries of visible zones
- **Entity Tracking**: Player position and nearby enemies
- **Real-time Updates**: Updates as player moves
- **Clean Architecture**: Proper separation of concerns

### Future Big Map Integration
The system is prepared for big map implementation:

#### Zoom Levels
- **0.5x**: Very zoomed out (400 unit radius)
- **1x**: Standard view (200 unit radius) - current minimap
- **2x**: Zoomed in (100 unit radius)
- **4x**: Close view (50 unit radius)
- **8x**: Very close (25 unit radius)

#### Big Map Features (TBD)
- **Full World View**: Show entire world at low zoom
- **Interactive Navigation**: Click to move view
- **Waypoint System**: Mark important locations
- **Fog of War**: Hide unexplored areas
- **Quest Markers**: Show quest objectives
- **Fast Travel**: Click to teleport to locations

## Technical Details

### Configuration
```typescript
interface MapConfig {
  readonly viewRadius: number;  // Radius of visible area
  readonly mapSize: number;     // Size of map in pixels
  readonly zoomLevel: number;   // Current zoom level
}
```

### Data Flow
1. **Player Position Update** → `usePlayer` hook
2. **MinimapService.getMapData()** → Calculate view bounds
3. **Zone Detection** → Find visible areas
4. **Entity Processing** → Get nearby enemies/items
5. **Component Rendering** → Display on screen

### Performance Optimizations
- **View Culling**: Only process visible zones
- **Entity Filtering**: Only show entities in view bounds
- **Efficient Rendering**: Use CSS transforms for positioning
- **Minimal Re-renders**: Update only when position changes

## Zone System Integration

### Zone Colors
- **Hub**: `#8b5cf6` (Violet)
- **Fields**: `#10b981` (Green)
- **Shards**: `#dc2626` (Red)
- **Nowhere**: `#6b7280` (Gray)

### Zone Boundaries
- **Dynamic Rendering**: Only show boundaries of visible zones
- **Precise Positioning**: Accurate boundary calculations
- **Visual Consistency**: Matches main game canvas

## Usage Examples

### Basic Minimap Usage
```typescript
// Get minimap service
const minimapService = bootstrap.getMinimapService();

// Get map data for current position
const mapData = await minimapService.getMapData(playerPosition, {
  viewRadius: 200,
  mapSize: 52,
  zoomLevel: 1
});

// Get entities to display
const entities = minimapService.getMapEntities(mapData, enemies);
```

### Future Big Map Usage
```typescript
// Get map data for big map
const bigMapData = await minimapService.getMapData(playerPosition, {
  viewRadius: 1000,  // Larger view
  mapSize: 400,      // Bigger display
  zoomLevel: 0.5     // Zoomed out
});
```

## Design System Integration

### Visual Style
- **iOS-inspired Design**: Glassmorphism effects
- **Consistent Colors**: Matches zone color scheme
- **Modern Aesthetics**: Rounded corners, subtle shadows
- **Responsive Layout**: Adapts to different screen sizes

### UI Components
- **Backdrop Blur**: Modern glass effect
- **Border Styling**: Subtle white borders
- **Shadow Effects**: Depth and elevation
- **Rounded Corners**: Consistent with design system

## Future Enhancements

### Phase 1: Big Map Implementation
- [ ] Create `BigMap` component
- [ ] Implement zoom controls
- [ ] Add pan/scroll functionality
- [ ] Integrate with existing `IMapService`

### Phase 2: Advanced Features
- [ ] Waypoint system
- [ ] Quest markers
- [ ] Fast travel
- [ ] Fog of war
- [ ] Map annotations

### Phase 3: Performance & Polish
- [ ] Map caching
- [ ] LOD (Level of Detail)
- [ ] Animation transitions
- [ ] Sound effects
- [ ] Accessibility features

## Testing Strategy

### Unit Tests
- [ ] `MinimapService` business logic
- [ ] Coordinate conversion accuracy
- [ ] Zone detection algorithms
- [ ] Entity filtering logic

### Integration Tests
- [ ] Component rendering
- [ ] Real-time updates
- [ ] Performance benchmarks
- [ ] Cross-browser compatibility

### User Testing
- [ ] Navigation effectiveness
- [ ] Visual clarity
- [ ] Performance on mobile
- [ ] Accessibility compliance

## Conclusion

The new minimap system provides a solid foundation for local area navigation while being fully prepared for future big map implementation. The clean architecture ensures maintainability and extensibility, while the design system integration provides a consistent user experience.

The system successfully addresses the original requirements:
- ✅ Shows local area around player (not whole world)
- ✅ Maintains same UI container and sizes
- ✅ Follows project's clean architecture
- ✅ Prepared for big map integration
- ✅ Elegant and performant implementation

