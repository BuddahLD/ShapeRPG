import React, { useState, useEffect, useMemo } from "react";
import { usePlayer } from "../presentation/hooks/usePlayerManager";

import { useGameState } from "../presentation/hooks/useGameStateManager";
import { MinimapService } from "../application/services/MinimapService";
import { MapData, MapEntity } from "../domain/interfaces/services/IMapService";
import { AppBootstrapService } from "../application/AppBootstrapService";

const Minimap: React.FC = () => {
  const { position } = usePlayer();
  const { enemies } = useGameState();

  const [minimapData, setMinimapData] = useState<MapData | null>(null);
  const [minimapEntities, setMinimapEntities] = useState<MapEntity[]>([]);

  // Minimap dimensions - square matching HP/MP container height
  const mapSize = 52;
  const viewRadius = 200; // Show 200 units around player

  // Memoize minimap service to avoid recreating on every render
  const minimapService = useMemo(() => {
    const bootstrap = AppBootstrapService.getInstance();
    return bootstrap.getMinimapService();
  }, []);

  // Update minimap data when player position changes (throttled)
  useEffect(() => {
    if (!position) return;

    console.log('Minimap: Position changed to:', position);

    const updateMinimap = async () => {
      try {
        console.log('Minimap: Updating with position:', position);
        const data = await minimapService.getMapData(position, {
          viewRadius,
          mapSize
        });
        
        console.log('Minimap: Got data:', data);
        setMinimapData(data);
        
        // Get entities for minimap
        const entities = minimapService.getMapEntities(data, enemies);
        setMinimapEntities(entities);
      } catch (error) {
        console.warn('Failed to update minimap:', error);
      }
    };

    // Throttle updates to reduce performance impact
    const timeoutId = setTimeout(updateMinimap, 100); // Update every 100ms max
    
    return () => clearTimeout(timeoutId);
  }, [position, enemies, minimapService]);

  if (!position || !minimapData) return null;

  // Convert world coordinates to minimap coordinates
  const worldToMinimap = (worldPos: { x: number; y: number }) => {
    return minimapService.worldToMap(worldPos, minimapData.viewBounds, mapSize);
  };

  // Render zone backgrounds for visible areas
  const renderZoneBackgrounds = () => {
    return minimapData.visibleAreas.map(area => {
      const color = minimapData.zoneColors.get(area.id) || '#6b7280';
      
      // Calculate zone position relative to view bounds
      const zoneLeft = worldToMinimap({ x: area.bounds.minX, y: 0 }).x;
      const zoneRight = worldToMinimap({ x: area.bounds.maxX, y: 0 }).x;
      const zoneTop = worldToMinimap({ x: 0, y: area.bounds.minY }).y;
      const zoneBottom = worldToMinimap({ x: 0, y: area.bounds.maxY }).y;
      
      // Clamp to minimap bounds
      const left = Math.max(0, zoneLeft);
      const right = Math.min(mapSize, zoneRight);
      const top = Math.max(0, zoneTop);
      const bottom = Math.min(mapSize, zoneBottom);
      
      if (right <= left || bottom <= top) return null;
      
      return (
        <div
          key={area.id}
          className="absolute opacity-30"
          style={{
            left: `${(left / mapSize) * 100}%`,
            top: `${(top / mapSize) * 100}%`,
            width: `${((right - left) / mapSize) * 100}%`,
            height: `${((bottom - top) / mapSize) * 100}%`,
            backgroundColor: color,
            borderRadius: '2px'
          }}
        />
      );
    });
  };

  // Render zone boundaries
  const renderZoneBoundaries = () => {
    return minimapData.visibleAreas.map(area => {
      const zoneLeft = worldToMinimap({ x: area.bounds.minX, y: 0 }).x;
      const zoneRight = worldToMinimap({ x: area.bounds.maxX, y: 0 }).x;
      const zoneTop = worldToMinimap({ x: 0, y: area.bounds.minY }).y;
      const zoneBottom = worldToMinimap({ x: 0, y: area.bounds.maxY }).y;
      
      const boundaries = [];
      
      // Left boundary
      if (zoneLeft >= 0 && zoneLeft <= mapSize) {
        boundaries.push(
          <div
            key={`${area.id}-left`}
            className="absolute top-0 h-full w-px bg-white/40"
            style={{ left: `${(zoneLeft / mapSize) * 100}%` }}
          />
        );
      }
      
      // Right boundary
      if (zoneRight >= 0 && zoneRight <= mapSize) {
        boundaries.push(
          <div
            key={`${area.id}-right`}
            className="absolute top-0 h-full w-px bg-white/40"
            style={{ left: `${(zoneRight / mapSize) * 100}%` }}
          />
        );
      }
      
      // Top boundary
      if (zoneTop >= 0 && zoneTop <= mapSize) {
        boundaries.push(
          <div
            key={`${area.id}-top`}
            className="absolute left-0 w-full h-px bg-white/40"
            style={{ top: `${(zoneTop / mapSize) * 100}%` }}
          />
        );
      }
      
      // Bottom boundary
      if (zoneBottom >= 0 && zoneBottom <= mapSize) {
        boundaries.push(
          <div
            key={`${area.id}-bottom`}
            className="absolute left-0 w-full h-px bg-white/40"
            style={{ top: `${(zoneBottom / mapSize) * 100}%` }}
          />
        );
      }
      
      return boundaries;
    }).flat();
  };

  // Render entities (player, enemies, etc.)
  const renderEntities = () => {
    return minimapEntities.map(entity => {
      const pos = worldToMinimap(entity.position);
      
      return (
        <div
          key={entity.id}
          className="absolute rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: pos.x,
            top: pos.y,
            width: entity.size,
            height: entity.size,
            backgroundColor: entity.color,
            border: entity.type === 'player' ? '1px solid #3b82f6' : 'none'
          }}
        />
      );
    });
  };

  return (
    <div className="pointer-events-auto">
      {/* Minimap Container */}
      <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-xl">
        {/* Minimap Display */}
        <div 
          className="relative border border-white/20 overflow-hidden"
          style={{ 
            width: mapSize, 
            height: mapSize, 
            backgroundColor: 'transparent',
            borderRadius: '10px'
          }}
        >
          {/* Zone backgrounds */}
          <div className="absolute inset-0" style={{ borderRadius: '10px' }}>
            {renderZoneBackgrounds()}
          </div>
          
          {/* Zone boundaries */}
          <div className="absolute inset-0">
            {renderZoneBoundaries()}
          </div>
          
          {/* Entities (player, enemies, etc.) */}
          <div className="absolute inset-0">
            {renderEntities()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Minimap;