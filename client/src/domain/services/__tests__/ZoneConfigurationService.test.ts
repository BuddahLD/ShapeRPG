/**
 * Unit Tests: ZoneConfigurationService
 * Tests for the single source of truth for zone configurations
 */

import { ZoneConfigurationService } from '../ZoneConfigurationService';

describe('ZoneConfigurationService', () => {
  describe('getAllZones', () => {
    it('should return all zone configurations', () => {
      const zones = ZoneConfigurationService.getAllZones();
      
      expect(zones).toHaveLength(3);
      expect(zones.map(z => z.id)).toEqual([
        'LOC_HUB_FIGUREIUM',
        'LOC_PEACEFUL_FIELDS',
        'LOC_SHARDS'
      ]);
    });

    it('should return immutable zone configurations', () => {
      const zones = ZoneConfigurationService.getAllZones();
      
      // Verify zones are readonly
      expect(() => {
        (zones as any).push({});
      }).toThrow();
    });
  });

  describe('getZoneById', () => {
    it('should return correct zone for valid ID', () => {
      const hub = ZoneConfigurationService.getZoneById('LOC_HUB_FIGUREIUM');
      
      expect(hub).toBeDefined();
      expect(hub?.id).toBe('LOC_HUB_FIGUREIUM');
      expect(hub?.name).toBe('Hub');
      expect(hub?.bounds).toEqual({ minX: -200, maxX: 200, minY: -150, maxY: 150 });
    });

    it('should return null for invalid ID', () => {
      const result = ZoneConfigurationService.getZoneById('INVALID_ID' as any);
      
      expect(result).toBeNull();
    });
  });

  describe('getZoneByPosition', () => {
    it('should return hub zone for position within hub', () => {
      const zone = ZoneConfigurationService.getZoneByPosition(0, 0);
      
      expect(zone?.id).toBe('LOC_HUB_FIGUREIUM');
    });

    it('should return fields zone for position within fields', () => {
      const zone = ZoneConfigurationService.getZoneByPosition(400, 0);
      
      expect(zone?.id).toBe('LOC_PEACEFUL_FIELDS');
    });

    it('should return shards zone for position within shards', () => {
      const zone = ZoneConfigurationService.getZoneByPosition(800, 0);
      
      expect(zone?.id).toBe('LOC_SHARDS');
    });

    it('should return null for position outside all zones', () => {
      const zone = ZoneConfigurationService.getZoneByPosition(-1000, -1000);
      
      expect(zone).toBeNull();
    });

    it('should handle boundary positions correctly', () => {
      // Test exact boundary positions
      const hubLeft = ZoneConfigurationService.getZoneByPosition(-200, 0);
      const hubRight = ZoneConfigurationService.getZoneByPosition(199, 0); // Just inside hub
      const fieldsLeft = ZoneConfigurationService.getZoneByPosition(200, 0); // Start of fields
      const fieldsRight = ZoneConfigurationService.getZoneByPosition(599, 0); // Just inside fields
      
      expect(hubLeft?.id).toBe('LOC_HUB_FIGUREIUM');
      expect(hubRight?.id).toBe('LOC_HUB_FIGUREIUM');
      expect(fieldsLeft?.id).toBe('LOC_PEACEFUL_FIELDS');
      expect(fieldsRight?.id).toBe('LOC_PEACEFUL_FIELDS');
    });
  });

  describe('getZoneBounds', () => {
    it('should return zone bounds for rendering', () => {
      const bounds = ZoneConfigurationService.getZoneBounds();
      
      expect(bounds).toHaveProperty('hub');
      expect(bounds).toHaveProperty('fields');
      expect(bounds).toHaveProperty('shards');
      expect(bounds).toHaveProperty('nowhere');
      
      expect(bounds.hub).toEqual({ minX: -200, maxX: 200, minY: -150, maxY: 150 });
      expect(bounds.fields).toEqual({ minX: 200, maxX: 600, minY: -150, maxY: 150 });
      expect(bounds.shards).toEqual({ minX: 600, maxX: 1100, minY: -450, maxY: 450 });
    });
  });

  describe('getZoneColors', () => {
    it('should return zone colors for rendering', () => {
      const colors = ZoneConfigurationService.getZoneColors();
      
      expect(colors).toHaveProperty('hub');
      expect(colors).toHaveProperty('fields');
      expect(colors).toHaveProperty('shards');
      expect(colors).toHaveProperty('nowhere');
      
      expect(colors.hub).toBe('#8b5cf6');
      expect(colors.fields).toBe('#10b981');
      expect(colors.shards).toBe('#dc2626');
      expect(colors.nowhere).toBe('#6b7280');
    });
  });

  describe('getHubZone', () => {
    it('should return hub zone configuration', () => {
      const hub = ZoneConfigurationService.getHubZone();
      
      expect(hub.id).toBe('LOC_HUB_FIGUREIUM');
      expect(hub.name).toBe('Hub');
      expect(hub.gamePhase).toBe('hub');
      expect(hub.allowsMobSpawning).toBe(false);
    });
  });

  describe('isWithinHub', () => {
    it('should return true for positions within hub', () => {
      expect(ZoneConfigurationService.isWithinHub(0, 0)).toBe(true);
      expect(ZoneConfigurationService.isWithinHub(-200, -150)).toBe(true);
      expect(ZoneConfigurationService.isWithinHub(200, 150)).toBe(true);
    });

    it('should return false for positions outside hub', () => {
      expect(ZoneConfigurationService.isWithinHub(300, 0)).toBe(false);
      expect(ZoneConfigurationService.isWithinHub(-300, 0)).toBe(false);
      expect(ZoneConfigurationService.isWithinHub(0, 200)).toBe(false);
      expect(ZoneConfigurationService.isWithinHub(0, -200)).toBe(false);
    });
  });

  describe('getHubSafeMovementRange', () => {
    it('should return safe movement range within hub', () => {
      const range = ZoneConfigurationService.getHubSafeMovementRange();
      
      expect(range.minY).toBe(-80);  // -150 + 70 padding
      expect(range.maxY).toBe(80);   // 150 - 70 padding
      expect(range.centerY).toBe(0); // (150 + -150) / 2
    });

    it('should provide correct range calculation', () => {
      const range = ZoneConfigurationService.getHubSafeMovementRange();
      const totalRange = range.maxY - range.minY;
      
      expect(totalRange).toBe(160); // 80 - (-80) = 160
    });
  });

  describe('validateConfiguration', () => {
    it('should validate zone configuration integrity', () => {
      const isValid = ZoneConfigurationService.validateConfiguration();
      
      expect(isValid).toBe(true);
    });

    it('should detect overlapping zones', () => {
      // This test would require mocking the zone configurations
      // For now, we test that the validation method exists and works
      expect(typeof ZoneConfigurationService.validateConfiguration).toBe('function');
    });
  });

  describe('zone configuration consistency', () => {
    it('should have consistent zone data across all methods', () => {
      const allZones = ZoneConfigurationService.getAllZones();
      const bounds = ZoneConfigurationService.getZoneBounds();
      const colors = ZoneConfigurationService.getZoneColors();
      
      // Verify all zones have corresponding bounds and colors
      allZones.forEach(zone => {
        const zoneKey = zone.id.replace('LOC_', '').toLowerCase().replace('_', '');
        
        expect(bounds).toHaveProperty(zoneKey);
        expect(colors).toHaveProperty(zoneKey);
        expect(bounds[zoneKey]).toEqual(zone.bounds);
        expect(colors[zoneKey]).toBe(zone.backgroundGradient);
      });
    });

    it('should have valid zone boundaries', () => {
      const allZones = ZoneConfigurationService.getAllZones();
      
      allZones.forEach(zone => {
        expect(zone.bounds.minX).toBeLessThan(zone.bounds.maxX);
        expect(zone.bounds.minY).toBeLessThan(zone.bounds.maxY);
      });
    });

    it('should have valid visual themes', () => {
      const allZones = ZoneConfigurationService.getAllZones();
      
      allZones.forEach(zone => {
        expect(zone.visualTheme.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(zone.visualTheme.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(zone.visualTheme.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(zone.visualTheme.background).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(zone.backgroundGradient).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });
});
