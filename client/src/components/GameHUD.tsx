import React, { useState, useEffect } from "react";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGameState } from "../lib/stores/useGameState";

// Design system component for UI containers
const UIContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`backdrop-blur-md bg-white/20 border border-white/30 shadow-lg ${className}`}>
    {children}
  </div>
);

const GameHUD: React.FC = () => {
  const { player } = usePlayer();
  const { currentLocation, setDrawingRune } = useGameState();
  const [showLocationIndicator, setShowLocationIndicator] = useState(true); // Show on start
  const [previousLocation, setPreviousLocation] = useState<string | null>(null);

  // Handle location change fade effect and initial display
  useEffect(() => {
    if (currentLocation !== previousLocation) {
      setShowLocationIndicator(true);
      const timer = setTimeout(() => {
        setShowLocationIndicator(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
    setPreviousLocation(currentLocation);
  }, [currentLocation, previousLocation]);

  if (!player) return null;

  const handleRuneButtonPress = () => {
    setDrawingRune(true);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top Bar - HP and Mana - Using design system container */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <UIContainer className="p-2 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-stone-100 text-xs font-semibold">HP</span>
            <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(player.stats.hp / 100) * 100}%` }}
              />
            </div>
            <span className="text-stone-100 text-xs">{player.stats.hp}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-stone-100 text-xs font-semibold">MP</span>
            <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(player.stats.mana / 50) * 100}%` }}
              />
            </div>
            <span className="text-stone-100 text-xs">{player.stats.mana}</span>
          </div>
        </UIContainer>
      </div>
      
      {/* Location Indicator - Horizontally centered, lighter text */}
      {showLocationIndicator && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-auto pt-4">
          <UIContainer className="px-4 py-2 transition-all duration-1000 ease-in-out">
            <div className="flex justify-center">
              <span className="text-neutral-100 text-xs font-medium">
                {currentLocation === "LOC_HUB_FIGUREIUM" ? "Figureium Hub" : 
                 currentLocation === "LOC_PEACEFUL_FIELDS" ? "Peaceful Fields" : "Arena #1"}
              </span>
            </div>
          </UIContainer>
        </div>
      )}

      {/* Bottom Bar - XP and Level - Thinner with bottom padding */}
      <div className="absolute bottom-6 left-6 right-6 pointer-events-auto">
        <UIContainer className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-stone-100 text-xs font-semibold">LVL {player.level}</span>
              <div className="w-28 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(player.xp / (100 * Math.pow(player.level, 2))) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-stone-100 text-xs font-medium">
                Gold: {player.gold}
              </div>
              <div className="text-stone-100 text-xs font-medium">
                XP: {player.xp}/{100 * Math.pow(player.level, 2)}
              </div>
            </div>
          </div>
        </UIContainer>
      </div>

      {/* Rune Button - Only in combat areas - Modern iOS design */}
      {currentLocation === "LOC_ARENA_1" && (
        <div className="fixed bottom-20 right-8 transform translate-x-0 z-20 pointer-events-auto">
          <div
            ref={(el) => {
              if (el) {
                const rect = el.getBoundingClientRect();
                console.log('RUNE BUTTON DIAMETER:', rect.width, 'x', rect.height);
              }
            }}
            className="backdrop-blur-md bg-white/20 rounded-full border border-white/30 shadow-lg w-22 h-22 flex items-center justify-center transition-all duration-300 hover:bg-white/30"
            style={{ touchAction: 'none', boxSizing: 'border-box' }}
          >
            <div
              className="relative w-full h-full rounded-full flex items-center justify-center"
              onMouseDown={handleRuneButtonPress}
              onTouchStart={handleRuneButtonPress}
            >
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-stone-100 drop-shadow-sm"
                style={{ pointerEvents: 'none' }}
              >
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="m21 12-6-3-6 3-6-3"/>
                <path d="M12 8L8 4l4-4 4 4-4 4"/>
                <path d="M12 16l4 4-4 4-4-4 4-4"/>
              </svg>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GameHUD;
