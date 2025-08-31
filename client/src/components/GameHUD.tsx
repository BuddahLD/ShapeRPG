import React, { useState, useEffect } from "react";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGameState } from "../lib/stores/useGameState";
import StatsInventoryModal from "./StatsInventoryModal";

interface GameHUDProps {
  showCharInfo: boolean;
  setShowCharInfo: (show: boolean) => void;
  activeTab: 'stats' | 'spells' | 'inventory';
  setActiveTab: (tab: 'stats' | 'spells' | 'inventory') => void;
}

// Design system component for UI containers
const UIContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-xl ${className}`}>
    {children}
  </div>
);

const GameHUD: React.FC<GameHUDProps> = ({ showCharInfo, setShowCharInfo, activeTab, setActiveTab }) => {
  const { player } = usePlayer();
  const { currentLocation, setDrawingRune } = useGameState();
  const [showLocationIndicator, setShowLocationIndicator] = useState(false);
  const [locationOpacity, setLocationOpacity] = useState(0);
  const [shownLocations, setShownLocations] = useState<Set<string>>(new Set());

  // ATOMIC: Location popup with smooth animation - triggers once per location
  useEffect(() => {
    if (currentLocation && !shownLocations.has(currentLocation)) {
      // Mark as shown immediately
      setShownLocations(prev => {
        const newSet = new Set(prev);
        newSet.add(currentLocation);
        return newSet;
      });
      
      // Trigger animation
      setShowLocationIndicator(true);
      
      // Fade in
      const fadeInTimer = setTimeout(() => {
        setLocationOpacity(1);
      }, 50);
      
      // Fade out after 2 seconds
      const fadeOutTimer = setTimeout(() => {
        setLocationOpacity(0);
      }, 2000);
      
      // Hide after fade completes
      const hideTimer = setTimeout(() => {
        setShowLocationIndicator(false);
      }, 2500);
      
      return () => {
        clearTimeout(fadeInTimer);
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [currentLocation]); // ATOMIC: Only depends on location changes

  if (!player) return null;

  const handleRuneButtonPress = () => {
    setDrawingRune(true);
  };

  const handleLevelBarClick = () => {
    setShowCharInfo(true);
    setActiveTab('inventory');
  };

  const handleCloseCharInfo = () => {
    setShowCharInfo(false);
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
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-stone-100 text-xs font-semibold">MP</span>
            <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(player.stats.mana / 50) * 100}%` }}
              />
            </div>
          </div>
        </UIContainer>
      </div>
      
      {/* Location Indicator - Below minimap with smooth fade animation */}
      {showLocationIndicator && (
        <div 
          className="absolute right-6 pointer-events-auto transition-all duration-500 ease-in-out transform" 
          style={{ 
            top: '86px', 
            width: '56px',
            opacity: locationOpacity,
            transform: `translateY(${locationOpacity === 1 ? '0' : '-8px'}) scale(${locationOpacity === 1 ? '1' : '0.95'})`,
            transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          <UIContainer className="px-2 py-1">
            <div className="flex items-center justify-center">
              <span className="text-neutral-100 text-xs font-medium">
                {currentLocation === "LOC_HUB_FIGUREIUM" ? "Hub" : 
                 currentLocation === "LOC_PEACEFUL_FIELDS" ? "Fields" : "Arena"}
              </span>
            </div>
          </UIContainer>
        </div>
      )}

      {/* Bottom Bar - XP and Level - Thinner with bottom padding */}
      <div className="absolute bottom-6 left-6 right-6 pointer-events-auto">
        <div 
          onClick={handleLevelBarClick}
          className="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <UIContainer className="px-4 py-2 hover:bg-white/25 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-stone-100 text-xs font-semibold">
                  LVL {player.level}
                </span>
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
      </div>

      {/* Rune Button - Only in combat areas - Modern iOS design */}
      {currentLocation === "LOC_ARENA_1" && (
        <div className="fixed bottom-20 right-8 transform -translate-x-0 z-20 pointer-events-auto">
          <div
            className="backdrop-blur-md bg-white/20 rounded-full border border-white/30 shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-white/30"
            style={{ touchAction: 'none', boxSizing: 'border-box', width: '42px', height: '42px', minWidth: '42px', minHeight: '42px' }}
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

      {/* Char Info Modal */}
      <StatsInventoryModal 
        isOpen={showCharInfo}
        onClose={handleCloseCharInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

    </div>
  );
};

export default GameHUD;
