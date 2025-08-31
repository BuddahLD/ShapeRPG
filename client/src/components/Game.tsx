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
import { GameEngine } from "../lib/gameEngine/GameEngine";

const Game: React.FC = () => {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { currentLocation, isDrawingRune, initializeGame } = useGameState();
  const { initializePlayer } = usePlayer();
  const [showCharInfo, setShowCharInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'spells' | 'inventory'>('inventory');

  useEffect(() => {
    console.log('Game component: Initializing...');
    
    // Initialize game engine
    gameEngineRef.current = new GameEngine();
    console.log('Game component: GameEngine created');
    
    // Initialize player with starting stats (backward compatibility)
    initializePlayer();
    console.log('Game component: Player initialized');
    
    // Initialize game through clean architecture
    initializeGame();
    console.log('Game component: Game initialized');
    
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
