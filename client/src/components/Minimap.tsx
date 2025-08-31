import React from "react";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGameState } from "../lib/stores/useGameState";
import { useWorldChunks } from "../lib/stores/useWorldChunks";

const Minimap: React.FC = () => {
  const { player } = usePlayer();
  const { currentLocation } = useGameState();
  const { getAllEnemies } = useWorldChunks();

  if (!player) return null;

  const enemies = getAllEnemies();
  
  // Minimap dimensions
  const mapWidth = 160;
  const mapHeight = 120;
  
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
  
  // Count enemies in each zone
  const enemyCount = {
    arena: enemies.filter(e => e.x >= 600).length,
    total: enemies.length
  };

  return (
    <div className="fixed top-6 right-6 z-30 pointer-events-auto">
      {/* Minimap Container */}
      <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-xl p-3 space-y-2">
        {/* Minimap Display */}
        <div 
          className="relative bg-black/30 rounded-lg border border-white/20 overflow-hidden"
          style={{ width: mapWidth, height: mapHeight }}
        >
          {/* Zone backgrounds */}
          <div className="absolute inset-0">
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
        
        {/* Current Location */}
        <div className="text-center">
          <span className="text-stone-100 text-xs font-medium">
            {currentLocation === "LOC_HUB_FIGUREIUM" ? "Hub" : 
             currentLocation === "LOC_PEACEFUL_FIELDS" ? "Fields" : "Arena"}
          </span>
        </div>
      </div>
      
      {/* Enemy Info Panel */}
      {enemyCount.total > 0 && (
        <div className="mt-2 backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-xl p-2">
          <div className="text-stone-100 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Arena Enemies:</span>
              <span className="text-red-400 font-semibold">{enemyCount.arena}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Enemies:</span>
              <span className="text-orange-400 font-semibold">{enemyCount.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Minimap;