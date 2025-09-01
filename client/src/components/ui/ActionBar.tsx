import React from "react";
import { useGameState } from "../../presentation/hooks/useGameStateManager";
import { useElementLayout } from "../../presentation/hooks/useUILayout";

/**
 * ActionBar - Single Responsibility: Provide game action buttons
 * SOLID: Extensible for new actions, focused on user interactions
 */
interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  variant?: 'default' | 'compact' | 'enhanced';
  actions?: Array<{
    icon: string;
    onClick: () => void;
    label?: string;
  }>;
}

export const ActionBar: React.FC<ActionBarProps> = ({ 
  className = "",
  position = 'top-right',
  variant = 'default',
  actions,
  ...props 
}) => {
  const { setDrawingRune } = useGameState();
  const { styles } = useElementLayout('actionButtons');

  const handleRuneButtonPress = () => {
    setDrawingRune(true);
  };

  const defaultActions = [{ icon: '☯', onClick: handleRuneButtonPress, label: 'Cast Rune' }];
  const actionItems = actions || defaultActions;

  return (
    <div 
      className={`pointer-events-auto ${className}`}
      style={styles}
      {...props}
    >
      <div className={`flex ${position.includes('left') ? 'flex-row' : 'flex-row-reverse'} gap-2`}>
        {actionItems.map((action, index) => {
          const size = variant === 'compact' ? 'w-8 h-8' : 'w-10 h-10';
          const sizePx = variant === 'compact' ? '32px' : '40px';
          
          // Special styling for rune button (☯) to match other UI containers
          const isRuneButton = action.icon === '☯';
          const containerClasses = isRuneButton 
            ? `backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-full ${size} flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200`
            : `${size} rounded-full border border-white/30 text-white font-semibold text-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center backdrop-blur-md`;
          
          return (
            <div 
              key={index}
              className={containerClasses}
              style={{
                width: sizePx,
                height: sizePx,
                minWidth: sizePx,
                minHeight: sizePx
              }}
            >
              <button
                onClick={action.onClick}
                className="w-full h-full rounded-full text-white font-semibold text-lg flex items-center justify-center transition-all duration-200"
                title={action.label}
              >
                {action.icon}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};