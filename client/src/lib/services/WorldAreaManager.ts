import { LocationId } from '../types/gameTypes';

export interface AreaBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface WorldArea {
  id: LocationId;
  name: string;
  bounds: AreaBounds;
  backgroundGradient: string;
  hasEnemies: boolean;
  gamePhase: 'hub' | 'combat';
  visualTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * WorldAreaManager - Single source of truth for all area definitions
 * Ensures visual and logical boundaries are perfectly aligned
 */
export class WorldAreaManager {
  private static readonly AREAS: WorldArea[] = [
    {
      id: "LOC_HUB_FIGUREIUM",
      name: "Hub",
      bounds: { minX: -200, maxX: 200, minY: -150, maxY: 150 },
      backgroundGradient: "#8b5cf6", // Violet
      hasEnemies: false,
      gamePhase: 'hub',
      visualTheme: {
        primary: '#a78bfa',
        secondary: '#c4b5fd', 
        accent: '#ddd6fe'
      }
    },
    {
      id: "LOC_PEACEFUL_FIELDS",
      name: "Fields", 
      bounds: { minX: 200, maxX: 600, minY: -150, maxY: 150 },
      backgroundGradient: "#10b981", // Green
      hasEnemies: false,
      gamePhase: 'combat',
      visualTheme: {
        primary: '#34d399',
        secondary: '#6ee7b7',
        accent: '#a7f3d0'
      }
    },
    {
      id: "LOC_ARENA_1",
      name: "Arena",
      bounds: { minX: 600, maxX: 2600, minY: -150, maxY: 150 },
      backgroundGradient: "#dc2626", // Red
      hasEnemies: true,
      gamePhase: 'combat',
      visualTheme: {
        primary: '#fb7185',
        secondary: '#fda4af',
        accent: '#fecdd3'
      }
    }
  ];

  /**
   * Get all world areas
   */
  static getAllAreas(): WorldArea[] {
    return [...this.AREAS];
  }

  /**
   * Get area by ID
   */
  static getAreaById(id: LocationId): WorldArea | undefined {
    return this.AREAS.find(area => area.id === id);
  }

  /**
   * Get area containing the given position
   */
  static getAreaForPosition(x: number, y: number): WorldArea | undefined {
    return this.AREAS.find(area => 
      x >= area.bounds.minX && 
      x <= area.bounds.maxX &&
      y >= area.bounds.minY && 
      y <= area.bounds.maxY
    );
  }

  /**
   * Check if position is within area bounds
   */
  static isPositionInArea(x: number, y: number, areaId: LocationId): boolean {
    const area = this.getAreaById(areaId);
    if (!area) return false;
    
    return x >= area.bounds.minX && 
           x <= area.bounds.maxX &&
           y >= area.bounds.minY && 
           y <= area.bounds.maxY;
  }

  /**
   * Get visual boundaries for rendering
   * Returns screen-space coordinates for drawing area backgrounds
   */
  static getVisualBoundaries(playerX: number, playerY: number, screenCenterX: number): Array<{
    areaId: LocationId;
    name: string;
    gradient: string;
    screenStartX: number;
    screenEndX: number;
    bounds: AreaBounds;
  }> {
    return this.AREAS.map(area => ({
      areaId: area.id,
      name: area.name,
      gradient: area.backgroundGradient,
      screenStartX: screenCenterX + (area.bounds.minX - playerX),
      screenEndX: screenCenterX + (area.bounds.maxX - playerX),
      bounds: area.bounds
    }));
  }

  /**
   * Detect zone transitions
   */
  static checkTransition(x: number, y: number, currentLocation: LocationId): {
    newLocation: LocationId | null;
    transitionDetected: boolean;
    area: WorldArea | undefined;
  } {
    const area = this.getAreaForPosition(x, y);
    
    if (!area) {
      return {
        newLocation: null,
        transitionDetected: false,
        area: undefined
      };
    }

    const transitionDetected = area.id !== currentLocation;
    
    return {
      newLocation: area.id,
      transitionDetected,
      area
    };
  }

  /**
   * Get world bounds (for movement constraints)
   */
  static getWorldBounds(): AreaBounds {
    const allAreas = this.getAllAreas();
    return {
      minX: Math.min(...allAreas.map(a => a.bounds.minX)),
      maxX: Math.max(...allAreas.map(a => a.bounds.maxX)),
      minY: Math.min(...allAreas.map(a => a.bounds.minY)),
      maxY: Math.max(...allAreas.map(a => a.bounds.maxY))
    };
  }
}