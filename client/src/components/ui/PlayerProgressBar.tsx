import React from "react";
import { usePlayer } from "../../presentation/hooks/usePlayerManager";
import { useElementLayout } from "../../presentation/hooks/useUILayout";
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
  const { level, experience, gold, experienceProgress } = usePlayer();
  const { styles } = useElementLayout('bottomBar');

  if (!level) return null;

  const containerVariant = variant === 'compact' ? 'minimal' : 'default';

  return (
    <div 
      className={`pointer-events-auto ${className}`}
      style={styles}
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
                LVL {level}
              </span>
              <div className="w-28 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${experienceProgress * 100}%` 
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {showGold && (
                <div className="text-stone-100 text-xs font-medium">
                  Gold: {gold}
                </div>
              )}
              {showXP && (
                <div className="text-stone-100 text-xs font-medium">
                  XP: {experience}/{100 * Math.pow(level, 2)}
                </div>
              )}
            </div>
          </div>
        </UIContainer>
      </div>
    </div>
  );
};