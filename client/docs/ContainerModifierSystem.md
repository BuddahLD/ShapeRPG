# Container Modifier System

## Overview

The Container Modifier System implements a standard TypeScript/React composition pattern that allows you to wrap any component with content-wrapping behavior without affecting the base component. This follows the **Zero-Impact Development** principle and **Composition over Modification** rule.

## Core Principles

### 1. Zero Impact on Base Components
- Base components like `PlayerStatsDisplay` and `Minimap` remain completely unchanged
- All existing functionality and UI behavior is preserved
- No breaking changes to existing code

### 2. Composition Over Inheritance
- Use composition to extend functionality
- No modification of existing components
- Easy to add/remove features through props

### 3. Standard TypeScript/React Patterns
- Follows familiar React composition patterns
- Uses TypeScript for type safety
- Leverages React's component composition model

## Components

### HPMPContainer
Wraps the HP/MP display with content-wrapping capabilities.

```tsx
import { HPMPContainer } from './ui/HPMPContainer';

// Basic usage with content wrapping
<HPMPContainer 
  wrapContent={true}
  maxWidth="300px"
  className="bg-blue-900/20"
>
  <div>Additional content here</div>
</HPMPContainer>

// Without content wrapping (base component)
<HPMPContainer wrapContent={false} />
```

**Props:**
- `wrapContent`: Toggle content wrapping on/off
- `maxWidth/maxHeight`: Control container dimensions
- `variant`: HP/MP display variant
- `showLabels`: Show/hide HP/MP labels
- `position`: Position of the display
- `children`: Additional content to display below HP/MP

### MinimapContainer
Wraps the minimap with content-wrapping capabilities.

```tsx
import { MinimapContainer } from './ui/MinimapContainer';

// With legend and controls
<MinimapContainer 
  showLegend={true}
  showControls={true}
  maxWidth="250px"
  className="bg-green-900/20"
/>

// With custom content
<MinimapContainer maxWidth="200px">
  <div>Custom minimap content</div>
</MinimapContainer>
```

**Props:**
- `wrapContent`: Toggle content wrapping on/off
- `maxWidth/maxHeight`: Control container dimensions
- `showLegend`: Show minimap legend
- `showControls`: Show minimap controls
- `children`: Custom content below minimap

### UIContainerModifier
Generic container modifier that can wrap any component.

```tsx
import { UIContainerModifier } from './ui/UIContainerModifier';

<UIContainerModifier
  wrapContent={true}
  maxWidth="400px"
  padding="16px"
  backgroundColor="rgba(255, 0, 0, 0.1)"
  glassmorphism={true}
  floating={true}
>
  <div>Any content here</div>
</UIContainerModifier>
```

**Props:**
- `wrapContent`: Toggle content wrapping
- `maxWidth/maxHeight`: Container dimensions
- `padding/margin`: Spacing control
- `backgroundColor/borderColor`: Visual styling
- `borderRadius`: Corner rounding
- `shadow`: Box shadow
- `backdropBlur`: Background blur effect
- `glassmorphism`: Apply glassmorphism styling
- `floating`: Add floating animation
- `animationDuration`: Animation timing

### Higher-Order Component Factory
Create modified versions of components using `withContainerModifier`.

```tsx
import { withContainerModifier } from './ui/UIContainerModifier';

// Create enhanced component
const EnhancedComponent = withContainerModifier(BaseComponent, {
  glassmorphism: true,
  maxWidth: '300px',
  floating: true
});

// Use enhanced component
<EnhancedComponent {...props} />
```

## Usage Examples

### 1. Basic Content Wrapping
```tsx
// HP/MP with additional stats
<HPMPContainer wrapContent={true} maxWidth="280px">
  <div className="text-xs text-gray-300 p-2 bg-gray-800/50 rounded">
    <div>Attack: +15</div>
    <div>Defense: +8</div>
    <div>Speed: +12</div>
  </div>
</HPMPContainer>
```

### 2. Enhanced Minimap
```tsx
// Minimap with full features
<MinimapContainer 
  showLegend={true}
  showControls={true}
  maxWidth="220px"
  className="bg-indigo-900/20 border-indigo-500/30"
>
  <div className="text-xs text-indigo-200 p-2 bg-indigo-900/30 rounded">
    <div>Zone: Arena</div>
    <div>Enemies: 3</div>
  </div>
</MinimapContainer>
```

### 3. Generic Content Wrapper
```tsx
// Custom content container
<UIContainerModifier
  wrapContent={true}
  maxWidth="500px"
  padding="20px"
  backgroundColor="rgba(0, 100, 255, 0.1)"
  borderColor="rgba(0, 100, 255, 0.3)"
  borderRadius="16px"
  glassmorphism={true}
  floating={true}
  animationDuration="3s"
>
  <div className="text-white">
    <h2 className="text-xl font-bold mb-4">Custom Content</h2>
    <p>This is wrapped with the generic container modifier.</p>
    <p>It can contain any type of content and apply various styling options.</p>
  </div>
</UIContainerModifier>
```

## Benefits

### 1. Maintainability
- Clear separation of concerns
- Easy to understand and modify
- No hidden side effects

### 2. Reusability
- Modifiers can be applied to any component
- Consistent behavior across the application
- Easy to create new modifiers

### 3. Flexibility
- Toggle features on/off easily
- Customize appearance without code changes
- Support for any additional content

### 4. Performance
- No unnecessary re-renders
- Efficient component composition
- Minimal overhead

## Best Practices

### 1. Use Composition
- Always prefer composition over modification
- Create new wrapper components for new functionality
- Keep base components simple and focused

### 2. Consistent Naming
- Use descriptive names for wrapper components
- Follow the `ComponentName + Container` pattern
- Use clear prop names

### 3. Default Values
- Provide sensible defaults for all props
- Use `wrapContent={false}` to get base component behavior
- Make modifiers opt-in rather than opt-out

### 4. Type Safety
- Extend existing interfaces when possible
- Use TypeScript for better development experience
- Provide proper prop types for all modifiers

## Migration Guide

### From Direct Component Usage
```tsx
// Before
<PlayerStatsDisplay />

// After
<HPMPContainer wrapContent={false} />
// or
<HPMPContainer wrapContent={true} maxWidth="250px" />
```

### From Custom Wrappers
```tsx
// Before
<div className="custom-wrapper">
  <Minimap />
  <div className="custom-content">...</div>
</div>

// After
<MinimapContainer 
  wrapContent={true}
  maxWidth="200px"
  className="custom-wrapper"
>
  <div className="custom-content">...</div>
</MinimapContainer>
```

## Future Enhancements

### 1. Animation System
- More animation types
- Custom easing functions
- Animation chaining

### 2. Theme Integration
- Dark/light mode support
- Custom color schemes
- Dynamic styling

### 3. Accessibility
- Screen reader support
- Keyboard navigation
- Focus management

### 4. Performance Optimization
- Lazy loading
- Memoization
- Virtual scrolling support

## Conclusion

The Container Modifier System provides a powerful, flexible way to extend UI components without modifying their core functionality. It follows React best practices and maintains the clean architecture principles of the project.

By using this system, you can:
- Add new features without breaking existing code
- Create consistent UI patterns across the application
- Maintain clean, maintainable code
- Follow the zero-impact development principle
