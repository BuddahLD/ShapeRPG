import React from "react";
import { useGameState } from "../../lib/stores/useGameState";
import { UIContainer } from "./UIContainer";

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

  const handleRuneButtonPress = () => {
    setDrawingRune(true);
  };

  const positionStyles = {
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  const containerVariant = variant === 'compact' ? 'minimal' : variant === 'enhanced' ? 'enhanced' : 'default';
  const defaultActions = [{ icon: '⚡', onClick: handleRuneButtonPress, label: 'Cast Rune' }];
  const actionItems = actions || defaultActions;

  return (
    <div 
      className={`absolute ${positionStyles[position]} pointer-events-auto ${className}`}
      {...props}
    >
      <UIContainer variant={containerVariant} className={variant === 'compact' ? 'p-1' : 'p-2'}>
        <div className={`flex ${position.includes('left') ? 'flex-row' : 'flex-row-reverse'} gap-2`}>
          {actionItems.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`${variant === 'compact' ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all duration-200`}
              title={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      </UIContainer>
    </div>
  );
};