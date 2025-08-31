import React from "react";
import { useGameState } from "../../lib/stores/useGameState";
import { UIContainer } from "./UIContainer";

/**
 * ActionBar - Single Responsibility: Provide game action buttons
 * SOLID: Extensible for new actions, focused on user interactions
 */
interface ActionBarProps {
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({ className = "" }) => {
  const { setDrawingRune } = useGameState();

  const handleRuneButtonPress = () => {
    setDrawingRune(true);
  };

  return (
    <div className={`absolute top-6 right-6 pointer-events-auto ${className}`}>
      <UIContainer className="p-2">
        <button
          onClick={handleRuneButtonPress}
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
        >
          ⚡
        </button>
      </UIContainer>
    </div>
  );
};