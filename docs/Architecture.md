# System Architecture

## Overview
Shapes RPG: Figureium is built as a full-stack web application with a custom 2D game engine, following clean architecture principles and modern development practices.

## Frontend Architecture

### Core Framework
- **React 18**: Modern React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server

### Game Engine
- **Custom 2D Engine**: Built on HTML5 Canvas API
- **60fps Game Loop**: Optimized rendering cycle
- **Custom Shape Matching**: Rune recognition algorithms
- **Time-scaled Updates**: Delta-time based animations

### State Management
- **Zustand**: Lightweight state management
- **Global State**: Centralized game state
- **Component State**: Local component state management

### UI Architecture
- **Mobile-First Design**: Touch-optimized interface
- **Modular Components**: Reusable UI components
- **Responsive Canvas**: Adaptive sizing for different screens
- **Touch Controls**: Virtual joystick and gesture recognition

## Backend Architecture

### Server Framework
- **Express.js**: Fast, unopinionated web framework
- **TypeScript**: Type-safe backend development
- **ES Modules**: Modern JavaScript module system

### Storage Layer
- **Abstracted Storage**: Interface-based storage abstraction
- **In-Memory Storage**: Development and testing storage
- **Database Ready**: Prepared for persistent storage integration

### API Structure
- **RESTful Endpoints**: Standard HTTP API design
- **Minimal API**: Focused on essential functionality
- **Extensible Design**: Easy to add new endpoints

## Game Engine Components

### Core Systems
- **Player System**: Character management and movement
- **World System**: Chunk-based world management
- **Combat System**: Real-time battle mechanics
- **Spell System**: Magic and rune management
- **Enemy AI**: Intelligent opponent behaviors

### Technical Features
- **Chunk Loading**: Dynamic 400x400 unit chunks
- **Seamless Transitions**: Smooth zone transitions
- **Performance Optimization**: Efficient rendering and updates
- **Event System**: Decoupled game event handling

## Mobile Touch Controls

### Input Systems
- **Virtual Joystick**: Movement control
- **Gesture Recognition**: Rune drawing
- **Touch Zones**: Dedicated interaction areas
- **Adaptive Controls**: Context-aware input handling

### Control Features
- **Full-screen Gestures**: Rune drawing recognition
- **Zone-aware Collision**: Context-sensitive boundaries
- **Touch Optimization**: iPhone-specific optimizations

## Data Management

### Client-side Storage
- **Local Storage**: Game state persistence
- **Player Progress**: Save game data
- **Settings**: User preferences
- **Game Data**: Spells, enemies, items

### Data Structure
- **JSON Format**: Structured game data
- **Type-safe Interfaces**: TypeScript definitions
- **World Architecture**: Zone and chunk management

## Clean Architecture Implementation

### Layer Structure
1. **Domain Layer** (innermost)
   - Pure business logic
   - Entities and value objects
   - Domain services
   - No external dependencies

2. **Application Layer**
   - Use cases
   - Application services
   - Orchestration logic
   - Depends only on Domain layer

3. **Infrastructure Layer**
   - External dependencies
   - Repositories
   - Adapters
   - Framework integrations

4. **Presentation Layer**
   - UI components
   - State management
   - User interactions
   - Depends only on Application layer

### Dependency Rules
- **Inward Flow**: Dependencies flow inward only
- **No Layer Skipping**: Each layer depends only on the layer directly inside it
- **Interface Segregation**: Contracts defined through interfaces
- **Dependency Injection**: External dependencies injected through constructors

## Performance Considerations

### Game Loop Optimization
- **60fps Target**: Smooth gameplay experience
- **Delta-time Updates**: Consistent game speed
- **Separate Update Cycles**: Logic, rendering, and UI updates
- **Chunk Management**: Efficient world loading/unloading

### Rendering Optimization
- **Canvas Optimization**: Efficient drawing operations
- **Spatial Partitioning**: Smart object rendering
- **Memory Management**: Proper resource cleanup
- **Mobile Optimization**: Touch device performance

## Development Architecture

### Build System
- **Vite**: Frontend build tool
- **ESBuild**: Backend compilation
- **TypeScript**: Type checking and compilation
- **Hot Reloading**: Development efficiency

### Testing Strategy
- **Unit Testing**: Core logic testing
- **Service Layer Testing**: Pure function testing
- **Mock Dependencies**: External dependency isolation
- **High Coverage**: Comprehensive test coverage

### Code Organization
- **Feature-based Structure**: Organized by game features
- **Service Layer Pattern**: Business logic separation
- **Repository Pattern**: Data access abstraction
- **Manager Pattern**: State and logic coordination
