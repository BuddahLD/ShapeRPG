# Overview

Shapes RPG: Figureium is a minimalist 2D RPG where players control a square hero, casting spells by drawing runes. It features real-time combat, gesture-based magic, counterattack timing, and seamless world exploration. Developed as a full-stack web application with a mobile-first design, it targets iPhone touch controls and combines an iOS-inspired minimalist aesthetic with cartoon-like contours. The project aims to provide an immersive geometric adventure across distinct zones.

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

**Clean Architecture Rules**:
- **Layer Separation**: Code must be organized into four distinct layers with strict dependency rules
  - Domain Layer (innermost): Pure business logic, entities, value objects, domain services
  - Application Layer: Use cases, application services, orchestration logic
  - Infrastructure Layer: External dependencies, repositories, adapters, frameworks
  - Presentation Layer: UI components, state management, user interactions
- **Dependency Direction**: Dependencies must flow inward only (Presentation → Application → Domain)
- **No Layer Skipping**: Each layer may only depend on the layer directly inside it
- **Interface Segregation**: Use interfaces to define contracts between layers (ports & adapters)
- **Immutable Entities**: Domain entities should be immutable with business logic encapsulated
- **Pure Use Cases**: Application use cases should orchestrate domain objects without business logic
- **Repository Pattern**: Data persistence abstracted through repository interfaces
- **Dependency Injection**: External dependencies injected through constructor parameters

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

**SOLID Principles & Regression Prevention**:
- **Open/Closed Principle**: Components open for extension, closed for modification - extend/decorate existing functionality rather than changing it
- **Atomic Logic**: Create separate, independent UI elements and logic units that don't interfere with each other
- **Non-Breaking Extensions**: New functionality must not break existing features - use composition over modification
- **Exception Rule**: Only modify existing code when fixing confirmed bugs, never when adding new features
- **Separation of Concerns**: Keep business logic, UI state, and animation logic completely separate
- **Dependency Isolation**: Avoid cross-dependencies between unrelated features to prevent cascade failures

# System Architecture

## Frontend Architecture
The frontend is built with React 18 and TypeScript, using Vite. It features a custom 2D game engine on HTML5 Canvas for rendering. Zustand manages global state. The UI follows a mobile-first design with touch-optimized controls and a modular component structure. Key patterns include a 60fps game loop, event-driven combat, slow-motion during rune drawing, and responsive canvas sizing. Seamless world exploration with chunk-based loading and zone-aware systems enhance performance. UI components utilize an extensible prop interface adhering to the Open/Closed Principle.

## Backend Architecture
The backend uses Express.js with TypeScript and ES modules. It currently has a minimal API structure with an abstracted storage layer, ready for database integration. Express was chosen for rapid prototyping, and the interface-based storage allows for easy swapping between in-memory and persistent storage.

## Game Engine Components
Core systems include Player, World (seamless transitions, chunk loading), Combat (timing-based counterattacks), Shape Matching (rune recognition), Enemy AI (zone-specific behaviors), and Spell systems. The game loop uses time-scaled updates, delta-time animations, and separate update cycles for logic, rendering, and UI.

## Mobile Touch Controls
Input systems include a virtual joystick for movement, full-screen touch gesture recognition for rune drawing, and dedicated touch zones for counterattacks. Controls adapt based on game phase and zone-aware collision boundaries.

## Data Management
Client-side storage uses local storage for game state, player progress, and settings. Game data is structured in JSON for spells, enemies, and items, with type-safe interfaces. The world architecture supports seamless exploration across distinct zones (Hub, Peaceful Fields, Arena) with dynamic 400x400 unit chunk loading and unloading for performance.

## Design System
Implemented an iOS-inspired minimalist design with cartoon-like contours and a sophisticated pastel color palette. UI elements feature glassmorphism effects and floating animations. A reusable `UIContainer` design system component ensures consistent styling. Character information is presented via a comprehensive, tabbed modal, and the location indicator is refined for readability and positioning.

## Clean Architecture
The project employs a clean architecture with strict separation of concerns across four layers: Domain, Application, Infrastructure, and Presentation. This structure adheres to SOLID principles, dependency inversion, and the ports & adapters pattern, ensuring maintainability and testability. Dependencies flow strictly inwards.

# External Dependencies

## Frontend Dependencies
- **Core Framework**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS
- **UI Primitives**: Radix UI
- **State Management**: Zustand
- **Game Dev**: HTML5 Canvas API (custom engine), custom shape matching algorithms
- **Utilities**: Date-fns

## Backend Dependencies
- **Server Framework**: Express.js, TypeScript
- **ORM**: Drizzle (with PostgreSQL dialect)
- **Database Provider**: Neon Database
- **Development Tools**: ESBuild, TSX

## Database Architecture
Drizzle ORM is configured for PostgreSQL with schema definitions in TypeScript. It supports type-safe queries and includes a migration system for schema updates. Basic user authentication tables are prepared for future expansion.

## Build & Deployment
Development features concurrent frontend and backend processes with hot reloading. Production involves a static frontend build bundled with the Express server. Drizzle Kit manages database schema migrations.