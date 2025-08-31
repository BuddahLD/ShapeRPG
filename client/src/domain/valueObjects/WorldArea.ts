/**
 * Domain Value Object: WorldArea
 * Immutable representation of a game world area
 */

export interface AreaBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

export interface VisualTheme {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
}

export type LocationId = 'LOC_HUB_FIGUREIUM' | 'LOC_PEACEFUL_FIELDS' | 'LOC_ARENA_1';
export type GamePhase = 'hub' | 'combat' | 'exploration';

export class WorldArea {
  private readonly _id: LocationId;
  private readonly _name: string;
  private readonly _bounds: AreaBounds;
  private readonly _gamePhase: GamePhase;
  private readonly _visualTheme: VisualTheme;
  private readonly _allowsEnemySpawning: boolean;
  private readonly _backgroundGradient: string;

  constructor(
    id: LocationId,
    name: string,
    bounds: AreaBounds,
    gamePhase: GamePhase,
    visualTheme: VisualTheme,
    allowsEnemySpawning: boolean = false,
    backgroundGradient: string = '#000000'
  ) {
    // Domain validation
    if (bounds.minX >= bounds.maxX) throw new Error('Invalid X bounds');
    if (bounds.minY >= bounds.maxY) throw new Error('Invalid Y bounds');
    if (name.trim().length === 0) throw new Error('Area name cannot be empty');

    this._id = id;
    this._name = name;
    this._bounds = bounds;
    this._gamePhase = gamePhase;
    this._visualTheme = visualTheme;
    this._allowsEnemySpawning = allowsEnemySpawning;
    this._backgroundGradient = backgroundGradient;
  }

  // Getters
  get id(): LocationId { return this._id; }
  get name(): string { return this._name; }
  get bounds(): AreaBounds { return this._bounds; }
  get gamePhase(): GamePhase { return this._gamePhase; }
  get visualTheme(): VisualTheme { return this._visualTheme; }
  get allowsEnemySpawning(): boolean { return this._allowsEnemySpawning; }
  get backgroundGradient(): string { return this._backgroundGradient; }

  // Domain Operations
  containsPosition(x: number, y: number): boolean {
    return x >= this._bounds.minX && 
           x <= this._bounds.maxX &&
           y >= this._bounds.minY && 
           y <= this._bounds.maxY;
  }

  getArea(): number {
    const width = this._bounds.maxX - this._bounds.minX;
    const height = this._bounds.maxY - this._bounds.minY;
    return width * height;
  }

  getCenter(): { x: number; y: number } {
    return {
      x: (this._bounds.minX + this._bounds.maxX) / 2,
      y: (this._bounds.minY + this._bounds.maxY) / 2
    };
  }

  getDistanceFromCenter(x: number, y: number): number {
    const center = this.getCenter();
    const dx = x - center.x;
    const dy = y - center.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Domain Rules
  isHub(): boolean {
    return this._gamePhase === 'hub';
  }

  isCombatArea(): boolean {
    return this._gamePhase === 'combat';
  }

  isSafeZone(): boolean {
    return !this._allowsEnemySpawning;
  }

  equals(other: WorldArea): boolean {
    return this._id === other._id;
  }

  toString(): string {
    return `${this._name} (${this._id})`;
  }
}