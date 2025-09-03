import React, { useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";
import GameHUD from "./GameHUD";
import VirtualJoystick from "./VirtualJoystick";
import RuneDrawing from "./RuneDrawing";
import { MinimapContainer } from "./ui/MinimapContainer";
import Hub from "./Hub";
import Arena from "./Arena";
import Shop from "./Shop";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
// GameEngine removed - using clean architecture instead

const Game: React.FC = () => {
  const { currentLocation, isDrawingRune, initializeGame } = useGameState();
  const { initializePlayer, resetToHubSpawn } = usePlayer();
  const [showCharInfo, setShowCharInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'spells' | 'inventory'>('inventory');

  // Debug logging for modal state
  useEffect(() => {
    console.log('Game component: showCharInfo changed to:', showCharInfo);
    console.log('Game component: activeTab changed to:', activeTab);
  }, [showCharInfo, activeTab]);

  // Watch for location changes and reset player to hub spawn when returning
  useEffect(() => {
    if (currentLocation === "LOC_HUB_FIGUREIUM") {
      console.log('Game component: Player returned to hub, resetting to spawn position');
      resetToHubSpawn();
    }
  }, [currentLocation, resetToHubSpawn]);

  useEffect(() => {
    console.log('Game component: Initializing...');
    
    // GameEngine removed - using clean architecture instead
    
    // Initialize player with starting stats (backward compatibility)
    initializePlayer();
    console.log('Game component: Player initialized');
    
    // Initialize game through clean architecture
    initializeGame().then(() => {
      console.log('Game component: Game initialized successfully');
    }).catch((error) => {
      console.error('Game component: Failed to initialize game:', error);
    });
    
    // Force a re-render to ensure PlayerManager is properly initialized
    setTimeout(() => {
      console.log('Game component: Forcing re-render after initialization');
      setShowCharInfo(false); // Reset to trigger re-render
    }, 100);
    
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        console.log('Game component: GameEngine destroyed');
      }
    };
  }, [initializePlayer, initializeGame]);

  const renderLocationContent = () => {
    switch (currentLocation) {
      case "LOC_HUB_FIGUREIUM":
        return <Hub />;
      case "LOC_ARENA_1":
        return <Arena />;
      default:
        return <Hub />;
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Game Canvas */}
              <GameCanvas />
      
      {/* Location-specific content */}
      {renderLocationContent()}
      
      {/* Game HUD */}
      <GameHUD 
        showCharInfo={showCharInfo}
        setShowCharInfo={setShowCharInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {/* Virtual Joystick */}
      <VirtualJoystick isModalOpen={showCharInfo} />
      
      {/* Minimap - Top Right with Content Wrapping */}
      <MinimapContainer 
        wrapContent={true}
        maxWidth="200px"
        showLegend={false}
        showControls={false}
        className="bg-white/5 border-white/20"
      />
      
      {/* Rune Drawing Overlay */}
      {isDrawingRune && <RuneDrawing />}
    </div>
  );
};

export default Game;
