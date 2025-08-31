import React from "react";
import { PlayerStatsDisplay } from "./PlayerStatsDisplay";

/**
 * HPMPContainer - Single Responsibility: Wrap HP/MP display with content-wrapping container
 * SOLID: Composition over inheritance - extends base component without modification
 * Pattern: Standard TypeScript/React composition pattern
 */
interface HPMPContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: 'default' | 'compact' | 'detailed';
  showLabels?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  wrapContent?: boolean;
  maxWidth?: string;
  maxHeight?: string;
}

export const HPMPContainer: React.FC<HPMPContainerProps> = ({
  children,
  variant = 'default',
  showLabels = true,
  position = 'top-left',
  wrapContent = true,
  maxWidth = 'auto',
  maxHeight = 'auto',
  className = "",
  ...props
}) => {
  // Base HP/MP display component
  const baseHPMP = (
    <PlayerStatsDisplay
      variant={variant}
      showLabels={showLabels}
      position={position}
    />
  );

  // If not wrapping content, return base component
  if (!wrapContent) {
    return baseHPMP;
  }

  // Content-wrapping container with flexible dimensions
  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        maxWidth,
        maxHeight,
        width: 'fit-content',
        height: 'fit-content'
      }}
      {...props}
    >
      {/* Base HP/MP component */}
      {baseHPMP}
      
      {/* Additional content */}
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
};
