import React, { useEffect } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { usePlayer } from "../lib/stores/usePlayer";

const Arena: React.FC = () => {
  const { 
    setCurrentLocation, 
    spawnEnemies, 
    enemies, 
    clearEnemies,
    gamePhase,
    setGamePhase 
  } = useGameState();
  const { player } = usePlayer();

  useEffect(() => {
    // Clear any existing enemies and spawn new ones when entering arena
    clearEnemies();
    spawnEnemies();
    setGamePhase("combat");
    
    return () => {
      // Clean up when leaving arena
      clearEnemies();
      setGamePhase("hub");
    };
  }, []);

  const handleReturnToHub = () => {
    setCurrentLocation("LOC_HUB_FIGUREIUM");
  };

  const handleStartCombat = () => {
    clearEnemies();
    spawnEnemies();
    setGamePhase("combat");
  };

  if (!player) return null;

  return (
    <div className="absolute inset-0 z-5 pointer-events-none">
      {/* Combat Status */}
      {gamePhase === "combat" && enemies.length > 0 && (
        <div className="absolute top-6 right-6 pointer-events-auto">
          <div className="backdrop-blur-md bg-white/20 rounded-xl border border-white/30 shadow-lg px-3 py-2">
            <p className="text-neutral-100 text-xs font-medium text-center">
              Enemies: {enemies.filter(e => e.hp > 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Victory State */}
      {gamePhase === "combat" && enemies.length > 0 && enemies.every(e => e.hp <= 0) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-green-600 bg-opacity-90 rounded-lg p-6 text-center">
            <h2 className="text-white text-2xl font-bold mb-4">Victory!</h2>
            <p className="text-white mb-4">All enemies defeated!</p>
            <div className="space-x-4">
              <button
                onClick={handleStartCombat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Fight Again
              </button>
              <button
                onClick={handleReturnToHub}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Enemies State */}
      {enemies.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-black bg-opacity-70 rounded-lg p-6 text-center">
            <h2 className="text-white text-xl font-bold mb-4">Arena Ready</h2>
            <p className="text-white mb-4">Prepare for battle!</p>
            <div className="space-x-4">
              <button
                onClick={handleStartCombat}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 text-lg font-bold"
              >
                Start Combat
              </button>
              <button
                onClick={handleReturnToHub}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Combat Instructions */}
    </div>
  );
};

export default Arena;
