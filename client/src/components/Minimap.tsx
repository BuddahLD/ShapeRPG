import React from "react";
import { usePlayer } from "../lib/stores/usePlayer";
import { useWorldChunks } from "../lib/stores/useWorldChunks";

const Minimap: React.FC = () => {
  const { player } = usePlayer();
  const { getAllEnemies } = useWorldChunks();

  if (!player) return null;

  const enemies = getAllEnemies();
  
  // Minimap dimensions - square matching HP/MP container height
  const mapWidth = 52;
  const mapHeight = 52;
  
  // World bounds for minimap scaling
  const worldBounds = {
    minX: -200,
    maxX: 2600,
    minY: -110,
    maxY: 90
  };
  
  const worldWidth = worldBounds.maxX - worldBounds.minX;
  const worldHeight = worldBounds.maxY - worldBounds.minY;
  
  // Convert world coordinates to minimap coordinates
  const worldToMinimap = (x: number, y: number) => ({
    x: ((x - worldBounds.minX) / worldWidth) * mapWidth,
    y: ((y - worldBounds.minY) / worldHeight) * mapHeight
  });
  
  const playerPos = worldToMinimap(player.x, player.y);
  
  // Get zone colors
  const getZoneColor = (x: number) => {
    if (x >= -200 && x <= 200) return "#8b5cf6"; // Hub - violet
    if (x >= 200 && x <= 600) return "#10b981"; // Fields - green  
    if (x >= 600 && x <= 2600) return "#dc2626"; // Arena - red
    return "#6b7280"; // Default
  };

  

  return (
    <div className="fixed top-6 right-6 z-30 pointer-events-auto">
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
            borderRadius: '8px'
          }}
        >
          {/* Zone backgrounds */}
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '8px' }}>
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
            {/* Arena zone */}
            <div 
              className="absolute top-0 h-full opacity-30"
              style={{
                left: `${(800 / worldWidth) * 100}%`,
                width: `${(2000 / worldWidth) * 100}%`,
                backgroundColor: getZoneColor(1600)
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