import React from "react";
import Minimap from "../Minimap";
import { useElementLayout } from "../../presentation/hooks/useUILayout";

/**
 * MinimapContainer - Single Responsibility: Wrap minimap with content-wrapping container
 * SOLID: Composition over inheritance - extends base component without modification
 * Pattern: Standard TypeScript/React composition pattern
 */
interface MinimapContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  wrapContent?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  showLegend?: boolean;
  showControls?: boolean;
}

export const MinimapContainer: React.FC<MinimapContainerProps> = ({
  children,
  wrapContent = true,
  maxWidth = 'auto',
  maxHeight = 'auto',
  showLegend = false,
  showControls = false,
  className = "",
  ...props
}) => {
  const { styles } = useElementLayout('minimap');
  
  // Base minimap component
  const baseMinimap = <Minimap />;

  // If not wrapping content, return base component
  if (!wrapContent) {
    return baseMinimap;
  }

  // Content-wrapping container with flexible dimensions
  return (
    <div
      className={`flex flex-col pointer-events-auto ${className}`}
      style={{
        ...styles,
        maxWidth,
        maxHeight,
        width: styles.width || 'fit-content',
        height: styles.height || 'fit-content'
      }}
      ref={(el) => {
        if (el) {
          const rect = el.getBoundingClientRect();
          console.log('MinimapContainer rendered width:', rect.width);
          console.log('MinimapContainer rendered height:', rect.height);
        }
      }}
      {...props}
    >
      {/* Base minimap component */}
      {baseMinimap}
      
      {/* Legend section */}
      {showLegend && (
        <div className="mt-2 p-2 bg-white/10 rounded-lg border border-white/20">
          <div className="text-xs text-white/80 font-medium mb-1">Legend</div>
          <div className="flex items-center space-x-3 text-xs text-white/60">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Player</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-red-400 rounded-full"></div>
              <span>Mob</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls section */}
      {showControls && (
        <div className="mt-2 p-2 bg-white/10 rounded-lg border border-white/20">
          <div className="text-xs text-white/80 font-medium mb-1">Controls</div>
          <div className="text-xs text-white/60">
            <div>• Tap to focus</div>
            <div>• Drag to pan</div>
          </div>
        </div>
      )}
      
      {/* Additional content */}
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
};
