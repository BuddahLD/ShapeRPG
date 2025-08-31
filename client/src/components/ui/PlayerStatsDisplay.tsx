import React from "react";
import { usePlayer } from "../../lib/stores/usePlayer";
import { UIContainer } from "./UIContainer";

/**
 * PlayerStatsDisplay - Single Responsibility: Display HP and MP bars
 * SOLID: Open for extension (new stat types), closed for modification
 */
interface PlayerStatsDisplayProps {
  className?: string;
}

export const PlayerStatsDisplay: React.FC<PlayerStatsDisplayProps> = ({ className = "" }) => {
  const { player } = usePlayer();

  if (!player) return null;

  return (
    <div className={`absolute top-6 left-6 pointer-events-auto ${className}`}>
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
  );
};