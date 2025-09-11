import React, { useState, useEffect } from "react";
import { useGameState } from "../../presentation/hooks/useGameStateManager";
import { useElementLayout } from "../../presentation/hooks/useUILayout";
import { useAnimation } from "../../hooks/useAnimation";
import { UIContainer } from "./UIContainer";

/**
 * LocationIndicator - Single Responsibility: Show location change notifications
 * SOLID: Isolated animation and location detection logic
 */
interface LocationIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  variant?: 'default' | 'minimal' | 'enhanced';
  showAnimation?: boolean;
}

export const LocationIndicator: React.FC<LocationIndicatorProps> = ({
  duration = 2500,
  position = 'top-right',
  variant = 'default', 
  showAnimation = true,
  className = "",
  ...props
}) => {
  const { currentLocation } = useGameState();
  const { styles } = useElementLayout('locationIndicator');
  const [showLocationIndicator, setShowLocationIndicator] = useState(false);
  const [previousLocation, setPreviousLocation] = useState<string | null>(null);

  // ATOMIC: Animation Manager for location popup
  const { styles: popupStyles, startAnimation } = useAnimation({
    id: 'location-popup',
    duration,
    phases: [
      {
        name: 'fadeIn',
        startAt: 0,
        endAt: 500,
        styles: { opacity: 1, transform: 'scale(1)' }
      },
      {
        name: 'visible',
        startAt: 500,
        endAt: 2000,
        styles: { opacity: 1, transform: 'scale(1)' }
      },
      {
        name: 'fadeOut',
        startAt: 2000,
        endAt: 2500,
        styles: { opacity: 0, transform: 'scale(0.95)' }
      }
    ]
  });

  // ATOMIC: Location change detection and initial display
  useEffect(() => {
    if (currentLocation) {
      // Show on location change OR initial load
      const isLocationChange = currentLocation !== previousLocation;
      const isInitialLoad = previousLocation === null;
      
      if (isLocationChange || isInitialLoad) {
        setPreviousLocation(currentLocation);
        setShowLocationIndicator(true);
        
        // Start the animation (if enabled)
        if (showAnimation) {
          startAnimation();
        }
        
        // Hide after animation completes (only for location changes, not initial load)
        if (isLocationChange) {
          const hideTimer = setTimeout(() => {
            setShowLocationIndicator(false);
          }, duration);
          
          // Store timer ref for cleanup
          const timerRef = { current: hideTimer };
          
          return () => {
            if (timerRef.current) {
              clearTimeout(timerRef.current);
            }
          };
        }
      }
    }
  }, [currentLocation, previousLocation, startAnimation, showAnimation, duration]);

  if (!showLocationIndicator) return null;

  const getLocationName = (location: string) => {
    switch (location) {
      case "LOC_HUB_FIGUREIUM": return "Hub";
      case "LOC_PEACEFUL_FIELDS": return "Fields";
      case "LOC_SHARDS": return "Shards";
      case "LOC_NOWHERE": return "Nowhere";
      default: return "Unknown";
    }
  };

  const animationStyles = showAnimation ? {
    opacity: popupStyles.opacity || 0,
    transform: popupStyles.transform as string || 'scale(0.95)',
  } : { opacity: 1, transform: 'scale(1)' };

  return (
    <div 
      className={`pointer-events-auto transition-all duration-200 ease-in-out ${className}`} 
      style={{ 
        ...styles,
        ...animationStyles,
      }}
      {...props}
    >
      <UIContainer variant={variant} className="px-2 py-1">
        <div className="flex items-center justify-center">
          <span className="text-neutral-100 text-xs font-medium">
            {getLocationName(currentLocation || '')}
          </span>
        </div>
      </UIContainer>
    </div>
  );
};