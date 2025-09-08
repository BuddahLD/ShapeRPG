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
  const { setDrawingRune, isDrawingRune } = useGameState();
  const { styles } = useElementLayout('actionButtons');

  const handleRuneButtonPress = (e: React.TouchEvent | React.MouseEvent) => {
    setDrawingRune(true);
    
    // Get the touch/mouse coordinates from the screen, not the button
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Dispatch a custom event with the coordinates
    const customEvent = new CustomEvent('runeButtonPress', {
      detail: { clientX, clientY }
    });
    window.dispatchEvent(customEvent);
  };

  const handleRuneButtonRelease = () => {
    setDrawingRune(false);
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
          const shouldHideRuneButton = isRuneButton && isDrawingRune;
          const containerClasses = isRuneButton 
            ? `backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-full ${size} flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 ${shouldHideRuneButton ? 'opacity-0 pointer-events-none' : ''}`
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
                onTouchStart={isRuneButton ? handleRuneButtonPress : undefined}
                onTouchEnd={isRuneButton ? handleRuneButtonRelease : undefined}
                onMouseDown={isRuneButton ? handleRuneButtonPress : undefined}
                onMouseUp={isRuneButton ? handleRuneButtonRelease : undefined}
                onMouseLeave={isRuneButton ? handleRuneButtonRelease : undefined}
                className="w-full h-full rounded-full text-white font-semibold text-lg flex items-center justify-center transition-all duration-200"
                style={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation',
                  pointerEvents: isRuneButton ? 'auto' : 'auto'
                }}
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