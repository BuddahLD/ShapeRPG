import React from "react";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { usePlayer } from "../presentation/hooks/usePlayerManager";

const Hub: React.FC = () => {
  const { currentLocation, isDrawingRune } = useGameState();
  const { player } = usePlayer();

  // For now, just render a simple hub indicator
  // TODO: Implement full hub functionality with new architecture
  console.log('Hub component: currentLocation =', currentLocation, 'player =', player);

  return (
    <div className="absolute inset-0 z-5 pointer-events-none">
      {/* Simple hub indicator for now */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="bg-black bg-opacity-60 rounded-lg px-4 py-2 border border-white">
          <p className="text-white text-center text-sm">Hub Area</p>
          <p className="text-white text-center text-xs">Location: {currentLocation}</p>
        </div>
      </div>
    </div>
  );
};

export default Hub;
