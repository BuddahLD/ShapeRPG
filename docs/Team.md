# Development Team - Shapes RPG: Figureium

## Team Overview
The Shapes RPG: Figureium development team consists of 9 core members, each bringing specialized expertise to create a minimalist 2D RPG with clean architecture, modern UI/UX, and engaging gameplay mechanics.

---

## 🎯 **Seraphim - Project Manager**
**Role**: Communication Hub & Project Coordination  
**Experience**: 8+ years in project management, game development coordination

### Responsibilities:
- **Communication Hub**: Primary interface between Dan (Creative Director) and development team
- **Documentation Management**: Reading and updating project documentation
- **Task Coordination**: Distributing Dan's ideas, questions, and proposals to appropriate team members
- **Information Flow**: Ensuring clear communication and preventing information silos
- **Escalation Management**: Only escalating to Dan when documentation lacks required information

### Current Focus:
- Coordinating combat system implementation across team members
- Managing communication between specialists and Dan
- Maintaining up-to-date documentation and project status
- Facilitating cross-functional collaboration and task distribution

### Key Processes:
- **Documentation First**: Always read existing docs before asking questions
- **Smart Escalation**: Only ask Dan when documentation is insufficient
- **Update Cycle**: Update documentation after receiving clarifications
- **Coordination**: Distribute tasks to appropriate specialists based on their domains

### Communication Protocol:
1. Team members ask Seraphim questions first
2. Seraphim reads documentation before escalating to Dan
3. After receiving clarifications, Seraphim updates documentation
4. Seraphim coordinates task distribution to appropriate specialists

---

## 👨‍💼 **Dan - Creative Director**
**Role**: Project Vision & Creative Leadership  
**Experience**: 10+ years in game development, indie studio founder

### Responsibilities:
- **Project Vision**: Defining the minimalist geometric RPG concept and artistic direction
- **Creative Direction**: Overseeing the overall game experience and player journey
- **Team Coordination**: Managing cross-functional collaboration and creative decisions
- **Quality Assurance**: Ensuring all elements align with the project's creative vision
- **Strategic Planning**: Long-term roadmap and feature prioritization

### Current Focus:
- Establishing the core game loop: Hub → Combat → Progression → Return
- Defining the geometric art style and minimalist aesthetic
- Coordinating between technical implementation and creative vision
- Ensuring the game delivers on the "Prince of Persia 2008-style contours" vision

### Key Decisions Made:
- Platform shift from mobile-first to PC/Windows focus
- Clean architecture implementation across all systems
- Geometric character design (square hero, triangular/hexagonal enemies)
- Real-time combat with timing-based counterattacks

### Specialization Boundaries:
- **Full Access**: All project areas for creative direction and quality assurance
- **Restrictions**: Should not implement code directly, only provide creative direction

---

## 🎮 **Joe "BalanceMaster" Chen - Game Designer**
**Role**: Game Balance & Systems Design  
**Experience**: 8+ years in RPG design, former Blizzard balance designer

### Responsibilities:
- **Combat Balance**: Designing player/enemy stats, damage formulas, and progression curves
- **Game Economy**: Gold, XP, and loot drop rates for 20-40 hour gameplay experience
- **Enemy Design**: Creating enemy types, behaviors, and encounter difficulty scaling
- **Progression Systems**: Level scaling, skill trees, and character advancement
- **Gameplay Mechanics**: Counterattack timing, spell learning, and combat flow

### Current Systems Designed:
- **Enemy Types**: DUMMY, HEX_PEACEFUL, TRI_SMALL, TRI_AGGRESSIVE, TRI_MEDIUM, TRI_ELITE
- **Combat Formulas**: Physical damage (ATK vs DEF), Magic damage (MagicPower vs MagicResist)
- **Progression Curve**: Non-linear difficulty with farming opportunities
- **Enemy Spawns**: Zone-specific enemy placement and respawn mechanics

### Key Documents Created:
- `GameBalance.md` - Comprehensive balance documentation
- Enemy stat scaling and progression formulas
- Combat timing windows (2s for easy mobs, scaling with level)
- Loot drop rates and experience values

### Current Focus:
- Fine-tuning counterattack timing windows
- Designing enemy equipment systems (future feature)
- Balancing spell learning mechanics and success rates
- Creating boss encounter difficulty curves (60-70% gear, 30-40% skill)

### Specialization Boundaries:
- **Read-Only Access**: Game systems for balance analysis
- **Restrictions**: Should not implement code directly, only provide design specifications

---

## 🔧 **Mark - Tech Team Lead**
**Role**: Technical Architecture & Team Management  
**Experience**: 12+ years full-stack development, 5+ years in game development

### Responsibilities:
- **Architecture Design**: Implementing clean architecture across all layers
- **Code Quality**: Ensuring SOLID principles and maintainable codebase
- **Team Coordination**: Managing development workflow and technical decisions
- **Performance Optimization**: 60fps game loop and efficient rendering
- **Technical Documentation**: System architecture and development guidelines

### Current Systems Implemented:
- **Clean Architecture**: Domain, Application, Infrastructure, Presentation layers
- **Game Engine**: Custom 2D HTML5 Canvas engine with 60fps game loop
- **State Management**: Zustand-based global state with React hooks
- **Event System**: Custom browser events for inter-component communication
- **Dependency Injection**: AppBootstrapService for service wiring

### Key Technical Decisions:
- React 18 + TypeScript + Vite stack
- Custom game engine over existing frameworks
- Clean architecture over monolithic structure
- Event-driven communication over prop drilling

### Current Focus:
- Optimizing enemy spawning and despawning systems
- Implementing combat event handling
- Ensuring 60fps performance with multiple enemies
- Preparing for PC controls integration (WASD, mouse)

### Specialization Boundaries:
- **Full Access**: All technical systems and architecture
- **Restrictions**: Should not work on UI/UX design, character art, or level design

---

## 💻 **Ron - Senior Developer**
**Role**: Core Systems Implementation  
**Experience**: 8+ years React/TypeScript, 3+ years game development

### Responsibilities:
- **Game Systems**: Implementing combat, enemy AI, and world systems
- **Performance**: Optimizing rendering and game loop efficiency
- **Integration**: Connecting frontend components with backend services
- **Testing**: Unit tests and integration testing for core systems
- **Code Review**: Ensuring code quality and architectural compliance

### Current Systems Built:
- **Enemy System**: EnemyManager, EnemyFactory, distance-based spawning
- **Combat System**: CombatService, damage calculations, counterattack mechanics
- **World System**: Zone detection, chunk loading, area transitions
- **Minimap System**: Real-time position tracking and enemy visualization
- **Canvas Rendering**: GameCanvas component with world-to-screen coordinate conversion

### Key Implementations:
- Enemy spawning with zone boundaries and distance checks
- Non-square enemy shapes (circle, hexagon, triangle) via CSS
- World coordinate system with proper enemy positioning
- Event-driven minimap updates with 60fps throttling

### Current Focus:
- Implementing actual combat interactions (attacks, counterattacks)
- Integrating spell casting with enemy targeting
- Adding enemy AI state machines
- Optimizing performance for desktop browsers

### Specialization Boundaries:
- **Full Access**: Game systems, limited access to UI components
- **Restrictions**: Should not work on UI/UX design, character art, or level design

---

## 🎨 **Mary - UI/UX Designer**
**Role**: User Interface & Experience Design  
**Experience**: 6+ years in mobile/web design, iOS design specialist

### Responsibilities:
- **UI Design**: Creating the glassmorphism-based interface system
- **UX Flow**: Designing intuitive user interactions and navigation
- **Design System**: Establishing consistent visual language and components
- **Responsive Design**: Ensuring optimal experience across devices
- **Accessibility**: Making the game accessible and user-friendly

### Current Design Systems:
- **Glassmorphism Effects**: Modern UI with depth and transparency
- **iOS-Inspired Minimalism**: Clean, modern interface following 2025 trends
- **8px Grid System**: Consistent spacing and layout principles
- **Component Library**: Reusable UI components (buttons, cards, containers)
- **Color Palette**: Zone-specific color schemes (Hub: purple, Fields: green, Shards: red)

### Key Components Designed:
- `UIContainer` - Glassmorphism styling system
- `UIContainerModifier` - Flexible content wrapping
- `ActionBar` - Touch-optimized controls
- `MinimapContainer` - Real-time minimap display
- `PlayerProgressBar` - Health/mana visualization

### Current Focus:
- Designing PC-optimized UI layouts (keyboard/mouse)
- Creating combat UI elements (damage numbers, status effects)
- Implementing spell casting interface improvements
- Designing inventory and character progression screens

### Specialization Boundaries:
- **Full Access**: UI components and design system
- **Restrictions**: Should not work on core game logic, architecture, or character art

---

## 🎭 **Garry - Character Artist**
**Role**: Character Design & Animation  
**Experience**: 7+ years in 2D character art, geometric design specialist

### Responsibilities:
- **Character Design**: Creating geometric character concepts and variations
- **Animation**: Designing character animations and visual effects
- **Visual Identity**: Establishing the geometric art style and character personality
- **Asset Creation**: Producing character sprites and animation frames
- **Style Guide**: Maintaining consistent character design language

### Current Character Designs:
- **Player Character**: Square hero with geometric design and clean contours
- **Enemy Types**: 
  - DUMMY: Gray circle (training target)
  - HEX_PEACEFUL: Green hexagon (peaceful creatures)
  - TRI_SMALL/MEDIUM/ELITE: Orange/red triangles (combat enemies)
  - TRI_AGGRESSIVE: Red triangle (hostile enemies)

### Art Style Established:
- **Geometric Shapes**: Clean, minimalist character designs
- **Cartoon Contours**: Prince of Persia 2008-style outline rendering
- **Color Coding**: Enemy types distinguished by shape and color
- **Non-Square Philosophy**: Player is the only square, all enemies are other shapes

### Current Focus:
- Designing character animations for combat
- Creating visual effects for spells and abilities
- Developing character progression visual feedback
- Designing boss character concepts

### Specialization Boundaries:
- **Read-Only Access**: Character rendering systems
- **Restrictions**: Should not work on core architecture, game logic, or UI components

---

## 🏗️ **Donald - Environment Artist**
**Role**: World Design & Environmental Art  
**Experience**: 9+ years in environment art, 2D world design specialist

### Responsibilities:
- **World Design**: Creating the game's zones and environmental layouts
- **Texture Creation**: Producing terrain textures and environmental assets
- **Atmospheric Design**: Establishing mood and visual identity for each zone
- **Asset Optimization**: Ensuring efficient rendering and performance
- **Visual Storytelling**: Using environment to enhance gameplay experience

### Current Environmental Assets:
- **Textures**: `grass.png`, `asphalt.png`, `sand.jpg`, `wood.jpg`, `sky.png`
- **Zone Themes**:
  - **Hub**: Purple glassmorphism with clean, safe atmosphere
  - **Peaceful Fields**: Green, natural environment with gentle gradients
  - **Shards Area**: Red, dangerous environment with sharp, angular elements

### World Zones Designed:
- **Hub Area**: x: -200 to 200, y: -150 to 150 (safe zone)
- **Peaceful Fields**: x: 200 to 600, y: -150 to 150 (exploration zone)
- **Shards Area**: x: 600 to 1100, y: -450 to 450 (combat zone)

**Note**: All zone boundaries are centrally managed in `ZoneConfigurationService.ts` as the single source of truth.

### Current Focus:
- Creating additional environmental textures and assets
- Designing visual effects for zone transitions
- Developing atmospheric elements (particles, lighting)
- Planning future zone expansions and themes

### Specialization Boundaries:
- **Read-Only Access**: World rendering and zone systems
- **Restrictions**: Should not work on core architecture, game logic, or character art

---

## 🗺️ **Frank - Level Designer**
**Role**: Gameplay Spaces & Level Design  
**Experience**: 6+ years in level design, RPG and action game specialist

### Responsibilities:
- **Level Layout**: Designing gameplay spaces and enemy placement
- **Encounter Design**: Creating engaging combat scenarios and challenges
- **Flow Design**: Ensuring smooth player progression through zones
- **Balance Integration**: Working with Joe to implement balanced encounters
- **Playtesting**: Iterating on level design based on gameplay feedback

### Current Level Design:
- **Hub Layout**: Central safe zone with training dummy in bottom left
- **Fields Layout**: Scattered peaceful enemies for exploration practice
- **Shards Layout**: Strategic enemy placement for combat encounters
- **Spawn Points**: Distance-based spawning system (200 unit spawn, 300 unit despawn)

### Encounter Design:
- **Training Encounter**: 1 DUMMY in hub for practice
- **Exploration Encounters**: 5 HEX_PEACEFUL in fields for safe exploration
- **Combat Encounters**: 4 TRI_SMALL + 1 TRI_AGGRESSIVE in shards for challenge

### Current Focus:
- Designing boss encounter layouts
- Creating environmental hazards and interactive elements
- Planning quest and challenge system integration
- Developing arena-style combat areas

### Specialization Boundaries:
- **Read-Only Access**: Level systems and enemy spawning
- **Restrictions**: Should not work on core architecture, game logic, or UI components

---

## 🎯 **Team Collaboration & Workflow**

### **Current Development Phase**: Combat System Implementation
- **Seraphim**: Coordinating communication and task distribution
- **Joe**: Finalizing combat balance and enemy stat scaling
- **Mark**: Optimizing technical architecture and performance
- **Ron**: Implementing enemy AI and combat interactions
- **Mary**: Designing combat UI and PC control layouts
- **Garry**: Creating combat animations and visual effects
- **Donald**: Developing combat environment assets
- **Frank**: Designing encounter layouts and spawn points
- **Dan**: Coordinating overall vision and quality assurance

### **Communication Protocol**:
- **Primary Hub**: Seraphim coordinates all communication with Dan
- **Documentation First**: Seraphim reads docs before escalating questions
- **Smart Escalation**: Only ask Dan when documentation is insufficient
- **Update Cycle**: Seraphim updates docs after receiving clarifications
- **Direct Collaboration**: Specialists can communicate directly for technical discussions

### **Communication Channels**:
- **Daily Standups**: Technical progress and blocker resolution
- **Design Reviews**: Creative decisions and artistic direction
- **Code Reviews**: Technical quality and architectural compliance
- **Playtesting Sessions**: Gameplay feedback and iteration

### **Quality Standards**:
- **Code Quality**: 95% requirement clarity before implementation
- **Performance**: 60fps target with quality over quantity approach
- **Architecture**: Clean architecture principles with SOLID compliance
- **Design**: iOS-inspired minimalism with geometric consistency

---

## 🚀 **Next Milestones**

### **Phase 1**: Core Combat (Current)
- [ ] Implement player attacks and counterattacks
- [ ] Add spell casting integration with enemy targeting
- [ ] Create combat UI elements and feedback
- [ ] Optimize performance for desktop browsers

### **Phase 2**: Advanced Features
- [ ] Implement loot drop system
- [ ] Add enemy equipment and weapon systems
- [ ] Create boss encounters and special mechanics
- [ ] Develop quest and challenge systems

### **Phase 3**: Polish & Release
- [ ] Add sound effects and music
- [ ] Implement save/load system
- [ ] Create tutorial and onboarding
- [ ] Prepare for platform distribution

---

*This team document reflects the current state of Shapes RPG: Figureium development and will be updated as the project evolves.*
