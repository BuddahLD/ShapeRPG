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
      {/* Hub content will be added here later */}
    </div>
  );
};

export default Hub;
