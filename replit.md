# Overview

Shapes RPG: Figureium is a minimalist 2D RPG featuring geometric characters where the player controls a square hero who learns to cast spells by drawing runes using free-draw mechanics. The game combines real-time combat with gesture-based magic casting, counterattack timing windows, and a seamless world exploration system. Built as a full-stack web application with mobile-first design principles targeting iPhone touch controls.

## Recent Updates (August 2025)

**Seamless World System**: Replaced button-based navigation with natural walking exploration. Players can now walk continuously between connected zones: Hub → Peaceful Fields → Combat Arena.

**Zone-Based Gameplay**: Three distinct areas with unique visual themes and enemy types:
- **Figureium Hub**: Blue-themed safe zone with NPCs (weapon shop, armor shop, trainer)
- **Peaceful Fields**: Green-themed transition area with hexagon enemies
- **Combat Arena**: Brown-themed challenge area with triangle enemies

**Chunk Loading System**: Implemented dynamic world loading where areas load/unload based on player proximity for smooth transitions without loading delays.

**Enhanced Movement**: Virtual joystick now supports seamless movement across the entire world map with zone-aware collision detection. Fixed continuous movement lag with proper coordinate calculations and 60fps movement loop for responsive character control.

**Modern Design System (August 2025)**: Implemented iOS-inspired minimalist design with cartoon-like contours inspired by Prince of Persia 2008. Features sophisticated pastel color palette, glassmorphism UI elements, floating animations, and modern visual effects replacing primitive solid colors.

**UI Component System (August 30, 2025)**: Created reusable UIContainer design system component providing consistent glassmorphism styling across all game UI elements (HP/MP bars, location indicators, XP bars). Ensures uniform visual identity and reduces code duplication.

**Char Info System (August 30, 2025)**: Implemented comprehensive character information modal with tabbed interface (Inventory, Stats, Spells). Accessible via bottom bar tap (inventory) with fixed 500px height for consistent sizing across tabs. Features concise iOS-inspired design with proper z-index layering above all game elements and touch-friendly navigation. Rune button correctly triggers spell casting interface.

**Enhanced Location System (August 30, 2025)**: Refined location indicator with horizontal centering, improved text readability using light colors, and proper positioning relative to HP/MP containers. Shows for 2.5 seconds on game start and zone transitions.

**Territorial Background Rendering (August 30, 2025)**: Replaced single-zone background coloring with territorial system that renders multiple zone backgrounds simultaneously based on world coordinates. Players can now see Hub (violet), Peaceful Fields (green), and Arena (brown-red) territories at the same time, creating immersive visual world representation.

**Streamlined Canvas Rendering (August 30, 2025)**: Removed redundant zone text rendering from canvas layer, centralizing all UI text in the HUD component for better separation of concerns and cleaner visual presentation.

**Polished Touch Controls (August 31, 2025)**: Enhanced mobile interface with improved joystick behavior that automatically hides during modal interactions. Fixed z-index conflicts ensuring proper layer management. Made entire bottom status bar clickable for better accessibility. Refined rune button to correctly trigger spell casting mechanics as per game design.

# User Preferences

Preferred communication style: Simple, everyday language.

## Development Guidelines

**Core Architecture Principles**:
- **Separation of Concerns**: All core logic separated from UI components through service layer pattern
- **SOLID Principles**: Follow single responsibility, open/closed, Liskov substitution, interface segregation, and dependency inversion
- **KISS Principles**: Keep implementations simple and straightforward, avoid over-engineering
- **Abstraction**: Use effective abstractions that hide complexity while maintaining flexibility
- **Zero-Impact Development**: New functionality must have 0% impact on existing logic and UI until explicitly stated

**Code Quality Standards**:
- **Unit Testing**: All core logic must be comprehensively unit tested with high coverage
- **Atomic Functions**: Use small, focused functions that are easy to test and reason about
- **No Global Constants**: Avoid global state and constants, prefer dependency injection and configuration
- **Senior Practices**: Apply enterprise-grade patterns, proper error handling, and maintainable code structure
- **Type Safety**: Leverage TypeScript's type system for compile-time error prevention

**Testing Strategy**:
- Service layer functions must be pure and easily testable
- Business logic separated from state management for independent testing
- Comprehensive test coverage for critical systems (chunk loading, combat, spell casting)
- Mock external dependencies and focus on unit-level testing

**Design System Standards**:
- **iOS-Inspired Minimalism**: Clean, modern interface following 2025 design trends with glassmorphism effects
- **Cartoon Contours**: Prince of Persia 2008-style outline rendering for all game objects with rounded edges
- **Pastel Color Palette**: Sophisticated color schemes avoiding primitive solid colors, using authentic gradients
- **Modern Typography**: SF Pro Display/Text font families with proper weight hierarchy
- **Consistent Spacing**: 8px grid system for all UI elements and spacing decisions
- **Smooth Animations**: Cubic-bezier easing functions for natural iOS-like motion and transitions

**Automatic Updates Rule**: All approved design changes and architectural improvements are automatically incorporated into project documentation and development guidelines without requiring additional requests.

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
- Seamless world exploration with automatic zone transitions
- Chunk-based world loading for performance optimization
- Zone-aware enemy spawning and collision systems

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
- **World System**: Seamless zone transitions with chunk-based loading for performance
- **Combat System**: Turn-based combat with real-time counterattack windows and damage calculations
- **Shape Matching**: Algorithm for recognizing hand-drawn runes and mapping them to spells
- **Enemy AI**: Zone-specific behavioral patterns with different enemy types per area
- **Spell System**: Casting mechanics with mana costs and effect processing
- **Zone Management**: Automatic area detection with visual and gameplay changes per zone

**Game Loop Architecture**:
- Time-scaled updates for slow-motion effects during rune drawing
- Delta-time based animations for consistent performance across devices
- Separate update cycles for game logic, rendering, and UI state
- Chunk-based rendering optimization for large world areas
- Dynamic enemy and NPC loading based on player proximity

## Mobile Touch Controls

**Input Systems**:
- **Virtual Joystick**: Bottom-center positioned analog movement control for seamless world exploration
- **Rune Drawing**: Full-screen touch gesture recognition for spell casting
- **Touch Zones**: Dedicated areas for counterattack timing inputs
- **State-based Input**: Touch controls adapt based on game phase (movement disabled during rune drawing)
- **Zone-aware Controls**: Movement system adapts to different area collision boundaries

## Data Management

**Client-side Storage**:
- Game state persistence using local storage
- Player progress and inventory tracking
- Settings and preferences storage
- Chunk-based world data with dynamic loading/unloading

**Game Data Structure**:
- JSON-based configuration for spells, enemies, items, and game balance
- Modular data files for easy content updates
- Type-safe interfaces for all game entities
- Zone-specific content generation for procedural world areas

**World Architecture**:
- **Seamless Exploration**: Connected world areas without loading screens
- **Zone System**: Hub (NPCs/shops) → Peaceful Fields (hexagon enemies) → Arena (triangle enemies)
- **Chunk Loading**: Dynamic 400x400 unit chunks load within 2-chunk radius of player
- **Performance Optimization**: Automatic unloading of distant chunks to maintain smooth performance

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