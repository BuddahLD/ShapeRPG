import React from "react";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
import { useElementLayout } from "../presentation/hooks/useUILayout";

const Minimap: React.FC = () => {
  const { position } = usePlayer();

  if (!position) return null;

  const enemies: Array<{id: string, x: number, y: number}> = []; // Placeholder for enemies
  
  // Minimap dimensions - square matching HP/MP container height
  const mapWidth = 52;
  const mapHeight = 52;
  
  // World bounds for minimap scaling
  const worldBounds = {
    minX: -200,
    maxX: 1100,
    minY: -450,
    maxY: 450
  };
  
  const worldWidth = worldBounds.maxX - worldBounds.minX;
  const worldHeight = worldBounds.maxY - worldBounds.minY;
  
  // Convert world coordinates to minimap coordinates
  const worldToMinimap = (x: number, y: number) => ({
    x: ((x - worldBounds.minX) / worldWidth) * mapWidth,
    y: ((y - worldBounds.minY) / worldHeight) * mapHeight
  });
  
  const playerPos = worldToMinimap(position.x, position.y);
  
  // Get zone colors
  const getZoneColor = (x: number) => {
    if (x >= -200 && x <= 200) return "#8b5cf6"; // Hub - violet
    if (x >= 200 && x <= 600) return "#10b981"; // Fields - green  
    if (x >= 600 && x <= 1100) return "#dc2626"; // Shards - red
    return "#6b7280"; // Nowhere - gray
  };

  

  return (
    <div className="pointer-events-auto">
      {/* Minimap Container */}
      <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-xl" style={{ padding: '2px' }}>
        {/* Minimap Display */}
        <div 
          className="relative border border-white/20"
          style={{ 
            width: mapWidth, 
            height: mapHeight, 
            overflow: 'hidden', 
            backgroundColor: 'transparent',
            borderRadius: '10px'
          }}
        >
          {/* Zone backgrounds */}
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '10px' }}>
            {/* Hub zone */}
            <div 
              className="absolute top-0 h-full opacity-30"
              style={{
                left: '0%',
                width: `${(400 / worldWidth) * 100}%`,
                backgroundColor: getZoneColor(0)
              }}
            />
            {/* Fields zone */}
            <div 
              className="absolute top-0 h-full opacity-30"
              style={{
                left: `${(400 / worldWidth) * 100}%`,
                width: `${(400 / worldWidth) * 100}%`,
                backgroundColor: getZoneColor(400)
              }}
            />
            {/* Shards zone */}
            <div 
              className="absolute top-0 h-full opacity-30"
              style={{
                left: `${(800 / worldWidth) * 100}%`,
                width: `${(500 / worldWidth) * 100}%`,
                backgroundColor: getZoneColor(850)
              }}
            />
          </div>
          
          {/* Zone boundaries */}
          <div className="absolute inset-0">
            <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: `${(400 / worldWidth) * 100}%` }} />
            <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: `${(800 / worldWidth) * 100}%` }} />
          </div>
          
          {/* Player position */}
          <div
            className="absolute w-2 h-2 bg-white rounded-full border border-blue-400 shadow-lg transform -translate-x-1 -translate-y-1"
            style={{
              left: playerPos.x,
              top: playerPos.y
            }}
          />
          
          {/* Enemy dots */}
          {enemies.map(enemy => {
            const enemyPos = worldToMinimap(enemy.x, enemy.y);
            return (
              <div
                key={enemy.id}
                className="absolute w-1 h-1 bg-red-400 rounded-full transform -translate-x-0.5 -translate-y-0.5"
                style={{
                  left: enemyPos.x,
                  top: enemyPos.y
                }}
              />
            );
          })}
        </div>
        
      </div>
    </div>
  );
};

export default Minimap;