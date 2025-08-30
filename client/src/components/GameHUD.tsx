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
      {/* Top Bar - HP and Mana - Modern glassmorphism design */}
      <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-auto gap-4">
        <div className="backdrop-blur-md bg-white/20 rounded-2xl p-3 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="text-red-500 text-sm font-semibold">HP</span>
            <div className="w-28 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(player.stats.hp / 100) * 100}%` }}
              />
            </div>
            <span className="text-neutral-700 text-sm font-medium">{player.stats.hp}/100</span>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white/20 rounded-2xl p-3 border border-white/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="text-primary-500 text-sm font-semibold">MP</span>
            <div className="w-28 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(player.stats.mana / 50) * 100}%` }}
              />
            </div>
            <span className="text-neutral-700 text-sm font-medium">{player.stats.mana}/50</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar - XP and Level - Modern design */}
      <div className="absolute bottom-24 left-6 right-6 pointer-events-auto">
        <div className="backdrop-blur-md bg-white/20 rounded-2xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-secondary-600 text-sm font-semibold">LVL {player.level}</span>
              <div className="w-36 h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(player.xp / (100 * Math.pow(player.level, 2))) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-secondary-600 text-sm font-medium">
                Gold: {player.gold}
              </div>
              <div className="text-neutral-700 text-sm font-medium">
                XP: {player.xp}/{100 * Math.pow(player.level, 2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rune Button - Only in combat areas - Modern iOS design */}
      {currentLocation === "LOC_ARENA_1" && (
        <div className="absolute bottom-8 right-8 pointer-events-auto">
          <button
            onMouseDown={handleRuneButtonPress}
            onTouchStart={handleRuneButtonPress}
            className="w-18 h-18 backdrop-blur-md bg-primary-500/80 hover:bg-primary-600/90 rounded-2xl border border-white/30 flex items-center justify-center shadow-xl transition-all duration-300 active:scale-96 magic-glow"
            style={{ touchAction: 'manipulation' }}
          >
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              className="text-white drop-shadow-sm"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </button>
        </div>
      )}

      {/* Location Indicator - Modern design */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="backdrop-blur-md bg-white/25 rounded-full px-6 py-2 border border-white/40 shadow-lg">
          <span className="text-neutral-800 text-sm font-semibold">
            {currentLocation === "LOC_HUB_FIGUREIUM" ? "Figureium Hub" : 
             currentLocation === "LOC_PEACEFUL_FIELDS" ? "Peaceful Fields" : "Arena #1"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
