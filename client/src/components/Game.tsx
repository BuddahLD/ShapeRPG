import React, { useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";
import GameHUD from "./GameHUD";
import VirtualJoystick from "./VirtualJoystick";
import RuneDrawing from "./RuneDrawing";
import Minimap from "./Minimap";
import Hub from "./Hub";
import Arena from "./Arena";
import Shop from "./Shop";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
import { GameEngine } from "../lib/gameEngine/GameEngine";

const Game: React.FC = () => {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { currentLocation, isDrawingRune, initializeGame } = useGameState();
  const { initializePlayer } = usePlayer();
  const [showCharInfo, setShowCharInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'spells' | 'inventory'>('inventory');

  useEffect(() => {
    // Initialize game engine
    gameEngineRef.current = new GameEngine();
    
    // Initialize player with starting stats (backward compatibility)
    initializePlayer();
    
    // Initialize game through clean architecture
    initializeGame();
    
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
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
      <GameCanvas gameEngine={gameEngineRef.current} />
      
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
      <Minimap />
      
      {/* Rune Drawing Overlay */}
      {isDrawingRune && <RuneDrawing />}
    </div>
  );
};

export default Game;
