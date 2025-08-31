import React from "react";
import { usePlayer } from "../../presentation/hooks/usePlayerManager";
import { useElementLayout } from "../../presentation/hooks/useUILayout";
import { UIContainer } from "./UIContainer";

/**
 * PlayerStatsDisplay - Single Responsibility: Display HP and MP bars
 * SOLID: Open for extension (new stat types), closed for modification
 */
interface PlayerStatsDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'detailed';
  showLabels?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PlayerStatsDisplay: React.FC<PlayerStatsDisplayProps> = ({ 
  className = "", 
  variant = 'default',
  showLabels = true,
  position = 'top-left',
  ...props 
}) => {
  const { stats } = usePlayer();
  const { styles } = useElementLayout('healthBar');

  if (!stats) return null;

  const containerVariant = variant === 'compact' ? 'minimal' : 'default';

  return (
    <div 
      className={`pointer-events-auto ${className}`}
      style={styles}
      {...props}
    >
      <UIContainer variant={containerVariant} className={variant === 'compact' ? 'p-1 space-y-1' : 'p-2 space-y-2'}>
        <div className="flex items-center space-x-2">
          {showLabels && <span className="text-stone-100 text-xs font-semibold">HP</span>}
          <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {showLabels && <span className="text-stone-100 text-xs font-semibold">MP</span>}
          <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(stats.mana / stats.maxMana) * 100}%` }}
            />
          </div>
        </div>
      </UIContainer>
    </div>
  );
};