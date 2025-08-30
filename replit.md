# Overview

Shapes RPG: Figureium is a minimalist 2D RPG featuring geometric characters where the player controls a square hero who learns to cast spells by drawing runes using free-draw mechanics. The game combines real-time combat with gesture-based magic casting, counterattack timing windows, and a hub-based progression system. Built as a full-stack web application with mobile-first design principles targeting iPhone touch controls.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build system
- **Canvas-based Game Engine**: Custom 2D game engine using HTML5 Canvas for rendering geometric shapes, animations, and real-time combat
- **State Management**: Zustand stores for game state, player data, inventory, and audio management
- **Mobile-First UI**: Touch-optimized interface with virtual joystick controls and gesture-based rune drawing
- **Component Structure**: Modular React components for different game screens (Hub, Arena, Shop) with a main Game component orchestrating the experience

**Key Design Patterns**:
- Game loop architecture with requestAnimationFrame for smooth 60fps rendering
- Event-driven combat system with timing-based counterattacks
- Slow-motion mechanics during rune drawing phases
- Responsive canvas that adapts to device screen sizes

## Backend Architecture

**Server**: Express.js with TypeScript using ES modules
- **Minimal API**: Currently configured for future expansion with basic routing structure
- **Storage Interface**: Abstracted storage layer with in-memory implementation (prepared for database integration)
- **Development Environment**: Vite integration for hot module replacement in development

**Architectural Decisions**:
- Express chosen for simplicity and rapid prototyping
- Interface-based storage design allows easy swapping between memory and database implementations
- Middleware structure prepared for future authentication and session management

## Game Engine Components

**Core Systems**:
- **Player System**: Character movement, stats management, leveling, and inventory
- **Combat System**: Turn-based combat with real-time counterattack windows and damage calculations
- **Shape Matching**: Algorithm for recognizing hand-drawn runes and mapping them to spells
- **Enemy AI**: Basic behavioral patterns with attack timings and counterattack windows
- **Spell System**: Casting mechanics with mana costs and effect processing

**Game Loop Architecture**:
- Time-scaled updates for slow-motion effects during rune drawing
- Delta-time based animations for consistent performance across devices
- Separate update cycles for game logic, rendering, and UI state

## Mobile Touch Controls

**Input Systems**:
- **Virtual Joystick**: Bottom-center positioned analog movement control
- **Rune Drawing**: Full-screen touch gesture recognition for spell casting
- **Touch Zones**: Dedicated areas for counterattack timing inputs
- **State-based Input**: Touch controls adapt based on game phase (movement disabled during rune drawing)

## Data Management

**Client-side Storage**:
- Game state persistence using local storage
- Player progress and inventory tracking
- Settings and preferences storage

**Game Data Structure**:
- JSON-based configuration for spells, enemies, items, and game balance
- Modular data files for easy content updates
- Type-safe interfaces for all game entities

# External Dependencies

## Frontend Dependencies

**Core Framework**:
- React 18 with TypeScript for component architecture
- Vite for build tooling and development server
- TailwindCSS for utility-first styling with custom game theme

**UI Components**:
- Radix UI primitives for accessible, unstyled components
- Custom game-specific UI overlays for HUD elements
- Three.js ecosystem (@react-three/fiber, @react-three/drei) for potential 3D enhancements

**Game Development**:
- Canvas 2D API for rendering (no external game engine dependency)
- Custom shape matching algorithms
- Audio Web API for sound effects and background music

**State & Data**:
- Zustand for lightweight state management
- TanStack Query for future API integration
- Date-fns for time calculations

## Backend Dependencies

**Server Framework**:
- Express.js for HTTP server and API routes
- TypeScript for type safety across the entire codebase

**Database & Storage**:
- Drizzle ORM configured for PostgreSQL
- Neon Database (@neondatabase/serverless) as the cloud database provider
- Connection pooling and session management prepared via connect-pg-simple

**Development Tools**:
- ESBuild for server-side bundling
- TSX for TypeScript execution in development
- Runtime error handling and logging middleware

## Database Architecture

**ORM Setup**: Drizzle configured with PostgreSQL dialect
- Schema definitions in shared TypeScript files
- Type-safe database queries with inferred types
- Migration system for schema updates

**Prepared Tables**: Basic user authentication structure ready for expansion to include player profiles, game saves, and leaderboards

## Build & Deployment

**Development**: Concurrent frontend and backend development with hot reloading
**Production**: Static frontend build with Express server bundle
**Database Migrations**: Drizzle Kit for schema management and deployments