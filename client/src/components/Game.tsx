import React, { useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";
import GameHUD from "./GameHUD";
import VirtualJoystick from "./VirtualJoystick";
import RuneDrawing from "./RuneDrawing";
import { MinimapContainer } from "./ui/MinimapContainer";
import { LocationIndicator } from "./ui/LocationIndicator";
import Hub from "./Hub";

import Shop from "./Shop";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
import { AppBootstrapService } from "../application/AppBootstrapService";
// GameEngine removed - using clean architecture instead

const Game: React.FC = () => {
  const { currentLocation, isDrawingRune, initializeGame } = useGameState();
  const { resetToHubSpawn } = usePlayer();
  const [showCharInfo, setShowCharInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'spells' | 'inventory'>('inventory');
  const [isInitialized, setIsInitialized] = useState(false);


  // Debug logging for modal state
  useEffect(() => {
    console.log('Game component: showCharInfo changed to:', showCharInfo);
    console.log('Game component: activeTab changed to:', activeTab);
  }, [showCharInfo, activeTab]);

  // Watch for location changes
  useEffect(() => {
    // Only log location changes, do not force reset position here as it causes strict mode double-invocations
    // and re-renders during gameplay
    if (currentLocation === "LOC_HUB_FIGUREIUM") {
      console.log('Game component: Location is hub');
    }
  }, [currentLocation]);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('Game component: Initializing with AppBootstrap...');

      try {
        // Initialize AppBootstrap singleton
        const bootstrap = AppBootstrapService.getInstance();

        console.log('Game component: AppBootstrap initialized');

        // Initialize game (this will also initialize the player)
        await initializeGame();
        console.log('Game component: Game initialized successfully');

        // Mark as initialized
        setIsInitialized(true);

      } catch (error) {
        console.error('Game component: Failed to initialize:', error);
      }
    };

    initializeApp();

    return () => {
      console.log('Game component: Cleanup completed');
    };
  }, [initializeGame]);

  const renderLocationContent = () => {
    switch (currentLocation) {
      case "LOC_HUB_FIGUREIUM":
        return <Hub />;
      case "LOC_SHARDS":
        return null; // Shards is a regular area, no special component needed
      default:
        return <Hub />;
    }
  };

  // Show loading state until initialization is complete
  if (!isInitialized) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

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

      {/* Minimap */}
      <MinimapContainer
        wrapContent={true}
        maxWidth="200px"
        showLegend={false}
        showControls={false}
        className="border-white/20"
      />

      {/* Location Indicator */}
      <LocationIndicator
        variant="minimal"
        showAnimation={true}
      />

      {/* Rune Drawing Overlay */}
      {isDrawingRune && <RuneDrawing />}

    </div>
  );
};

export default Game;
