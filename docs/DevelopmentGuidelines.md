# Development Guidelines

## Core Architecture Principles

### Separation of Concerns
- All core logic separated from UI components through service layer pattern
- Business logic, UI state, and animation logic completely separate
- Clear boundaries between different system responsibilities

### SOLID Principles
- **Single Responsibility**: Each class/function has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes can substitute base classes
- **Interface Segregation**: Clients depend only on interfaces they use
- **Dependency Inversion**: High-level modules don't depend on low-level modules

### KISS Principles
- Keep implementations simple and straightforward
- Avoid over-engineering and unnecessary complexity
- Prefer clear, readable code over clever solutions

### Abstraction
- Use effective abstractions that hide complexity while maintaining flexibility
- Abstract common patterns into reusable components
- Balance abstraction with practical implementation needs

### Zero-Impact Development
- New functionality must have 0% impact on existing logic and UI until explicitly stated
- Maintain backward compatibility during development
- Test changes thoroughly to prevent regressions

## Critical Development Rules (August 31, 2025)

### Mandatory Patterns
- **Use Managers**: Implement managers, domain models, and UI models for proper separation
- **Manager Pattern**: Coordinate state and logic through dedicated manager classes
- **Domain Models**: Pure business logic entities
- **UI Models**: Presentation-specific data structures

### UI Development Rules
- **Relative Positioning**: Use relative positioning for UI elements to support screen scaling
- **Fixed Element Sizes**: Keep element sizes fixed while using relative positioning
- **Responsive Design**: Ensure UI works across different screen sizes
- **Touch Optimization**: Prioritize touch-friendly interactions

### Quality Assurance
- **Mandatory Testing**: All managers/helpers/workers must be tested before implementation
- **95% Requirement Clarity**: Only implement features/updates after 95% requirement clarity
- **Regression Prevention**: Ensure 0% impact on existing app logic or UI when making changes
- **Rules First**: Always read and follow rules before implementing anything

### Code Modification Rules
- **Exception Rule**: Only modify existing code when fixing confirmed bugs, never when adding new features
- **Non-Breaking Extensions**: New functionality must not break existing features
- **Composition Over Modification**: Use composition and extension rather than changing existing code
- **Open/Closed Principle**: Components open for extension, closed for modification

## Code Quality Standards

### Testing Requirements
- **Unit Testing**: All core logic must be comprehensively unit tested with high coverage
- **Service Layer Testing**: Service layer functions must be pure and easily testable
- **Mock Dependencies**: External dependencies should be mocked for testing
- **Test Coverage**: Aim for high test coverage on critical systems

### Function Design
- **Atomic Functions**: Use small, focused functions that are easy to test and reason about
- **Single Responsibility**: Each function should do one thing well
- **Pure Functions**: Prefer pure functions when possible
- **Clear Naming**: Use descriptive names that explain function purpose

### State Management
- **No Global Constants**: Avoid global state and constants
- **Dependency Injection**: Prefer dependency injection and configuration
- **Local State**: Keep state as local as possible
- **Immutable Data**: Use immutable data structures when appropriate

### Code Structure
- **Senior Practices**: Apply enterprise-grade patterns and proper error handling
- **Maintainable Code**: Write code that's easy to understand and modify
- **Type Safety**: Leverage TypeScript's type system for compile-time error prevention
- **Error Handling**: Implement proper error handling and validation

## Clean Architecture Rules

### Layer Separation
Code must be organized into four distinct layers with strict dependency rules:

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
   - Frameworks
   - Depends only on Application layer

4. **Presentation Layer**
   - UI components
   - State management
   - User interactions
   - Depends only on Application layer

### Dependency Rules
- **Inward Flow**: Dependencies must flow inward only (Presentation → Application → Domain)
- **No Layer Skipping**: Each layer may only depend on the layer directly inside it
- **Interface Segregation**: Use interfaces to define contracts between layers (ports & adapters)
- **Dependency Injection**: External dependencies injected through constructor parameters

### Implementation Guidelines
- **Immutable Entities**: Domain entities should be immutable with business logic encapsulated
- **Pure Use Cases**: Application use cases should orchestrate domain objects without business logic
- **Repository Pattern**: Data persistence abstracted through repository interfaces
- **Service Layer**: Business logic implemented in domain services

## Testing Strategy

### Testing Requirements
- **Service Layer Functions**: Must be pure and easily testable
- **Business Logic**: Separated from state management for independent testing
- **Critical Systems**: Comprehensive test coverage for chunk loading, combat, spell casting
- **External Dependencies**: Mocked for focused unit testing

### Test Organization
- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test layer interactions
- **Mock Usage**: Mock external dependencies to focus on unit logic
- **Test Coverage**: Aim for high coverage on business logic

## Design System Standards

### Visual Design
- **iOS-Inspired Minimalism**: Clean, modern interface following 2025 design trends
- **Glassmorphism Effects**: Modern UI elements with depth and transparency
- **Cartoon Contours**: Prince of Persia 2008-style outline rendering for all game objects
- **Rounded Edges**: Smooth, friendly geometric shapes

### Color and Typography
- **Pastel Color Palette**: Sophisticated color schemes avoiding primitive solid colors
- **Authentic Gradients**: Use of natural, authentic gradient effects
- **Modern Typography**: SF Pro Display/Text font families with proper weight hierarchy
- **Color Consistency**: Maintain consistent color usage across the application

### Layout and Spacing
- **8px Grid System**: All UI elements and spacing decisions based on 8px increments
- **Consistent Spacing**: Uniform spacing between related elements
- **Visual Hierarchy**: Clear information hierarchy through size and spacing
- **Responsive Layout**: Adapt to different screen sizes while maintaining proportions

### Animation and Motion
- **Smooth Animations**: Cubic-bezier easing functions for natural iOS-like motion
- **Floating Animations**: Subtle floating effects for UI elements
- **Transition Timing**: Consistent animation durations and easing
- **Performance**: Ensure animations don't impact game performance

## SOLID Principles & Regression Prevention

### Open/Closed Principle
- **Extension Over Modification**: Components open for extension, closed for modification
- **Decorator Pattern**: Use decoration and composition to add functionality
- **Plugin Architecture**: Design systems that can be extended without modification
- **Interface-based Design**: Define contracts that can be implemented by new components

### Atomic Logic
- **Independent Units**: Create separate, independent UI elements and logic units
- **No Interference**: Units should not interfere with each other
- **Modular Design**: Each feature should be self-contained
- **Clear Boundaries**: Well-defined interfaces between components

### Non-Breaking Extensions
- **Backward Compatibility**: New functionality must not break existing features
- **Composition Over Modification**: Use composition to add new capabilities
- **Interface Stability**: Maintain stable interfaces for existing functionality
- **Feature Flags**: Use feature flags for gradual rollout when possible

### Exception Handling
- **Bug Fixes Only**: Only modify existing code when fixing confirmed bugs
- **New Feature Isolation**: New features should be implemented in new code paths
- **Regression Testing**: Thoroughly test changes to prevent regressions
- **Change Documentation**: Document any necessary changes to existing code
