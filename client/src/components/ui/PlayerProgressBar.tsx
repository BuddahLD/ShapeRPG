import React from "react";
import { usePlayer } from "../../lib/stores/usePlayer";
import { UIContainer } from "./UIContainer";

/**
 * PlayerProgressBar - Single Responsibility: Display level, XP, and gold
 * SOLID: Focused on player progression display only
 */
interface PlayerProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onLevelBarClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  position?: 'bottom' | 'top';
  showGold?: boolean;
  showXP?: boolean;
}

export const PlayerProgressBar: React.FC<PlayerProgressBarProps> = ({ 
  onLevelBarClick, 
  variant = 'default',
  position = 'bottom',
  showGold = true,
  showXP = true,
  className = "",
  ...props 
}) => {
  const { player } = usePlayer();

  if (!player) return null;

  const positionStyles = position === 'bottom' ? 'bottom-6' : 'top-6';
  const containerVariant = variant === 'compact' ? 'minimal' : 'default';

  return (
    <div 
      className={`absolute ${positionStyles} left-6 right-6 pointer-events-auto ${className}`}
      {...props}
    >
      <div 
        onClick={onLevelBarClick}
        className="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <UIContainer variant={containerVariant} className={`px-4 py-2 hover:bg-white/25 transition-colors duration-200 ${variant === 'compact' ? 'px-2 py-1' : ''}`}>
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
              {showGold && (
                <div className="text-stone-100 text-xs font-medium">
                  Gold: {player.gold}
                </div>
              )}
              {showXP && (
                <div className="text-stone-100 text-xs font-medium">
                  XP: {player.xp}/{100 * Math.pow(player.level, 2)}
                </div>
              )}
            </div>
          </div>
        </UIContainer>
      </div>
    </div>
  );
};