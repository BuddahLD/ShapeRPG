/**
 * Domain Service: ZoneConfigurationService
 * Single source of truth for all zone boundaries and configurations
 * 
 * This service centralizes all zone-related data to ensure consistency
 * across the entire application and prevent duplication.
 */

import { AreaBounds, LocationId, GamePhase, VisualTheme } from '../valueObjects/WorldArea';

export interface ZoneConfiguration {
  readonly id: LocationId;
  readonly name: string;
  readonly bounds: AreaBounds;
  readonly gamePhase: GamePhase;
  readonly visualTheme: VisualTheme;
  readonly allowsMobSpawning: boolean;
  readonly backgroundGradient: string;
}

export class ZoneConfigurationService {
  /**
   * Centralized zone configurations
   * This is the SINGLE SOURCE OF TRUTH for all zone data
   */
  private static readonly ZONE_CONFIGURATIONS: ZoneConfiguration[] = [
    {
      id: 'LOC_HUB_FIGUREIUM',
      name: 'Hub',
      bounds: { minX: -200, maxX: 200, minY: -150, maxY: 150 },
      gamePhase: 'hub',
      visualTheme: {
        primary: '#a78bfa',
        secondary: '#c4b5fd', 
        accent: '#ddd6fe',
        background: '#faf5ff'
      },
      allowsMobSpawning: false,
      backgroundGradient: '#8b5cf6'
    },
    {
      id: 'LOC_PEACEFUL_FIELDS',
      name: 'Fields',
      bounds: { minX: 200, maxX: 600, minY: -150, maxY: 150 },
      gamePhase: 'exploration',
      visualTheme: {
        primary: '#34d399',
        secondary: '#6ee7b7',
        accent: '#a7f3d0',
        background: '#f0fdf4'
      },
      allowsMobSpawning: false,
      backgroundGradient: '#10b981'
    },
    {
      id: 'LOC_SHARDS',
      name: 'Shards',
      bounds: { minX: 600, maxX: 1100, minY: -450, maxY: 450 },
      gamePhase: 'exploration',
      visualTheme: {
        primary: '#fb7185',
        secondary: '#fda4af',
        accent: '#fecdd3',
        background: '#fff1f2'
      },
      allowsMobSpawning: true,
      backgroundGradient: '#dc2626'
    }
  ];

  /**
   * Get all zone configurations
   */
  static getAllZones(): readonly ZoneConfiguration[] {
    return this.ZONE_CONFIGURATIONS;
  }

  /**
   * Get zone configuration by ID
   */
  static getZoneById(id: LocationId): ZoneConfiguration | null {
    return this.ZONE_CONFIGURATIONS.find(zone => zone.id === id) || null;
  }

  /**
   * Get zone configuration by position
   */
  static getZoneByPosition(x: number, y: number): ZoneConfiguration | null {
    return this.ZONE_CONFIGURATIONS.find(zone => 
      x >= zone.bounds.minX && 
      x < zone.bounds.maxX &&
      y >= zone.bounds.minY && 
      y < zone.bounds.maxY
    ) || null;
  }

  /**
   * Get all zone boundaries for rendering
   */
  static getZoneBounds(): Record<string, AreaBounds> {
    const bounds: Record<string, AreaBounds> = {};
    
    this.ZONE_CONFIGURATIONS.forEach(zone => {
      const zoneKey = zone.id.replace('LOC_', '').toLowerCase().replace('_', '');
      bounds[zoneKey] = zone.bounds;
    });

    // Add "nowhere" zone for fallback
    bounds.nowhere = { 
      minX: -Infinity, 
      maxX: Infinity, 
      minY: -Infinity, 
      maxY: Infinity 
    };

    return bounds;
  }

  /**
   * Get zone colors for rendering
   */
  static getZoneColors(): Record<string, string> {
    const colors: Record<string, string> = {};
    
    this.ZONE_CONFIGURATIONS.forEach(zone => {
      const zoneKey = zone.id.replace('LOC_', '').toLowerCase().replace('_', '');
      colors[zoneKey] = zone.backgroundGradient;
    });

    // Add "nowhere" zone color
    colors.nowhere = '#6b7280';

    return colors;
  }

  /**
   * Get hub zone configuration
   */
  static getHubZone(): ZoneConfiguration {
    const hub = this.getZoneById('LOC_HUB_FIGUREIUM');
    if (!hub) {
      throw new Error('Hub zone configuration not found');
    }
    return hub;
  }

  /**
   * Check if a position is within hub boundaries
   */
  static isWithinHub(x: number, y: number): boolean {
    const hub = this.getHubZone();
    return x >= hub.bounds.minX && 
           x <= hub.bounds.maxX &&
           y >= hub.bounds.minY && 
           y <= hub.bounds.maxY;
  }

  /**
   * Get safe movement range within hub (with padding)
   */
  static getHubSafeMovementRange(): { minY: number; maxY: number; centerY: number } {
    const hub = this.getHubZone();
    const padding = 70; // 70 units padding from hub boundaries
    
    return {
      minY: hub.bounds.minY + padding,  // -150 + 70 = -80
      maxY: hub.bounds.maxY - padding,  // 150 - 70 = 80
      centerY: (hub.bounds.minY + hub.bounds.maxY) / 2  // 0
    };
  }

  /**
   * Validate zone configuration integrity
   */
  static validateConfiguration(): boolean {
    try {
      // Check for invalid bounds
      for (const zone of this.ZONE_CONFIGURATIONS) {
        if (zone.bounds.minX >= zone.bounds.maxX || zone.bounds.minY >= zone.bounds.maxY) {
          console.error(`Invalid bounds for zone: ${zone.id}`);
          return false;
        }
      }

      // Check for overlapping zones
      for (let i = 0; i < this.ZONE_CONFIGURATIONS.length; i++) {
        for (let j = i + 1; j < this.ZONE_CONFIGURATIONS.length; j++) {
          const zone1 = this.ZONE_CONFIGURATIONS[i];
          const zone2 = this.ZONE_CONFIGURATIONS[j];
          
          if (this.zonesOverlap(zone1.bounds, zone2.bounds)) {
            console.error(`Zone overlap detected: ${zone1.id} and ${zone2.id}`);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Zone configuration validation failed:', error);
      return false;
    }
  }

  /**
   * Check if two zone bounds overlap
   */
  private static zonesOverlap(bounds1: AreaBounds, bounds2: AreaBounds): boolean {
    return !(bounds1.maxX <= bounds2.minX || 
             bounds1.minX >= bounds2.maxX ||
             bounds1.maxY <= bounds2.minY || 
             bounds1.minY >= bounds2.maxY);
  }
}
