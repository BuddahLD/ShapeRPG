# Shapes RPG: Figureium

A minimalist 2D RPG built with React 18, TypeScript, and a custom HTML5 Canvas game engine. The project follows clean architecture principles with strict separation of concerns across four layers: Domain, Application, Infrastructure, and Presentation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ShapeRPG

# Install dependencies
npm install
```

### ✅ Current Status
**The app is currently running successfully at: http://localhost:5173**

### Running the App

#### Option 1: Client-Only Development (Recommended for UI development)
```bash
# Start just the client-side Vite dev server
cd client
npx vite --port 5173
```

The app will be available at: **http://localhost:5173**

#### Option 2: Full Stack Development
```bash
# Start both client and server
npm run dev
```

**Note**: The full stack mode may have socket binding issues on some systems. If you encounter `ENOTSUP` errors, use Option 1 for client development.

### Build for Production
```bash
npm run build
```

## 🎮 Game Features

- **2D RPG Gameplay**: Explore a chunk-based world with dynamic loading
- **Combat System**: Turn-based combat with spell casting and shape matching
- **Magic System**: Draw runes to cast spells with a custom spell system
- **World Exploration**: Navigate through different zones (Hub, Fields, Arena)
- **Touch Controls**: Mobile-optimized virtual joystick and gesture recognition
- **Modern UI**: Glassmorphism effects with iOS-inspired design

## 🏗️ Architecture

The project follows Clean Architecture principles with four distinct layers:

- **Domain Layer**: Pure business logic, entities, value objects
- **Application Layer**: Use cases, application services, orchestration
- **Infrastructure Layer**: External dependencies, repositories, adapters
- **Presentation Layer**: UI components, state management, user interactions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Zustand** for state management
- **HTML5 Canvas** for custom game engine

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** with Neon service

### Development
- **Vitest** for testing
- **ESBuild** for fast compilation
- **TypeScript** for type safety

## 📁 Project Structure

```
ShapeRPG/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── domain/         # Domain layer
│   │   ├── application/    # Application layer
│   │   ├── infrastructure/ # Infrastructure layer
│   │   ├── presentation/   # Presentation layer
│   │   └── lib/           # Game engine and utilities
│   ├── public/            # Static assets
│   └── index.html         # Entry point
├── server/                # Backend Express server
├── shared/                # Shared types and schemas
├── docs/                  # Project documentation
└── package.json           # Root dependencies
```

## 🎯 Development Guidelines

### Core Principles
- **Zero-Impact Development**: New functionality must have 0% impact on existing logic
- **Composition Over Modification**: Use composition and extension rather than changing existing code
- **Clean Architecture**: Strict layer separation with dependencies flowing inward only
- **SOLID Principles**: Follow all SOLID principles for maintainable code

### Testing
- **Mandatory Testing**: All managers/helpers/workers must be tested before implementation
- **Unit Testing**: Comprehensive unit tests with high coverage
- **Service Layer Testing**: Pure functions that are easily testable

## 🔧 Available Scripts

```bash
npm run dev          # Start full stack development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Game Design](./docs/GameDesign.md)** - Game mechanics and design
- **[Architecture](./docs/Architecture.md)** - Technical implementation details
- **[Development Guidelines](./docs/DevelopmentGuidelines.md)** - Coding standards
- **[Dependencies](./docs/Dependencies.md)** - Technical stack information
- **[Container Modifier System](./docs/ContainerModifierSystem.md)** - UI component system

## 🎨 UI Component System

The project includes a flexible container modifier system that allows you to wrap components with additional functionality without affecting the base components:

```tsx
// Basic usage
<HPMPContainer wrapContent={false} />

// With content wrapping and styling
<HPMPContainer 
  wrapContent={true}
  maxWidth="300px"
  className="bg-blue-900/20"
>
  <div>Additional content here</div>
</HPMPContainer>
```

## 🚨 Troubleshooting

### CSS Build Issues
If you encounter CSS build errors like `border-border` or `bg-background` classes not existing:
- These have been fixed in the current version
- The CSS now uses proper CSS variables instead of problematic `@apply` directives
- If you still see errors, restart the Vite dev server

### Socket Binding Issues
If you encounter `ENOTSUP` errors when running `npm run dev`, use the client-only approach:
```bash
cd client
npx vite --port 5173
```

### Port Conflicts
The default ports are:
- **Client**: 5173 (Vite dev server)
- **Server**: 5000 (Express API server)

If these ports are in use, you can specify different ports:
```bash
npx vite --port 3000  # Custom client port
```

## 🤝 Contributing

1. Read and follow the development guidelines in `docs/DevelopmentGuidelines.md`
2. Ensure all new functionality follows the zero-impact principle
3. Write comprehensive tests for new features
4. Follow the established clean architecture patterns
5. Update relevant documentation when making changes

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For development questions, refer to:
- **Architecture**: `docs/Architecture.md`
- **Development Rules**: `docs/DevelopmentGuidelines.md`
- **Game Design**: `docs/GameDesign.md`
- **Cursor Rules**: `.cursorrules` (for AI assistance)
