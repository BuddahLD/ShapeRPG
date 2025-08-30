import React from "react";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGameState } from "../lib/stores/useGameState";

const GameHUD: React.FC = () => {
  const { player } = usePlayer();
  const { currentLocation, setDrawingRune } = useGameState();

  if (!player) return null;

  const handleRuneButtonPress = () => {
    setDrawingRune(true);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top Bar - HP and Mana */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
        <div className="bg-black bg-opacity-50 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <span className="text-red-400 text-sm font-bold">HP</span>
            <div className="w-24 h-3 bg-gray-700 rounded">
              <div 
                className="h-full bg-red-500 rounded transition-all duration-300"
                style={{ width: `${(player.stats.hp / 100) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm">{player.stats.hp}/100</span>
          </div>
        </div>
        
        <div className="bg-black bg-opacity-50 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 text-sm font-bold">MP</span>
            <div className="w-24 h-3 bg-gray-700 rounded">
              <div 
                className="h-full bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${(player.stats.mana / 50) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm">{player.stats.mana}/50</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar - XP and Level */}
      <div className="absolute bottom-20 left-4 right-4 pointer-events-auto">
        <div className="bg-black bg-opacity-50 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 text-sm font-bold">LVL {player.level}</span>
              <div className="w-32 h-2 bg-gray-700 rounded">
                <div 
                  className="h-full bg-yellow-500 rounded transition-all duration-300"
                  style={{ 
                    width: `${(player.xp / (100 * Math.pow(player.level, 2))) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-yellow-400 text-sm">
                Gold: {player.gold}
              </div>
              <div className="text-white text-sm">
                XP: {player.xp}/{100 * Math.pow(player.level, 2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rune Button - Only in combat areas */}
      {currentLocation === "LOC_ARENA_1" && (
        <div className="absolute bottom-8 right-8 pointer-events-auto">
          <button
            onMouseDown={handleRuneButtonPress}
            onTouchStart={handleRuneButtonPress}
            className="w-16 h-16 bg-purple-600 hover:bg-purple-700 rounded-full border-4 border-purple-300 flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="text-white"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </button>
        </div>
      )}

      {/* Location Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-black bg-opacity-50 rounded-lg px-4 py-2">
          <span className="text-white text-sm font-bold">
            {currentLocation === "LOC_HUB_FIGUREIUM" ? "Figureium Hub" : "Arena #1"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
