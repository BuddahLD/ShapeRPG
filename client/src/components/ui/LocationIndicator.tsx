import React, { useState, useEffect } from "react";
import { useGameState } from "../../lib/stores/useGameState";
import { useAnimation } from "../../hooks/useAnimation";
import { UIContainer } from "./UIContainer";

/**
 * LocationIndicator - Single Responsibility: Show location change notifications
 * SOLID: Isolated animation and location detection logic
 */
export const LocationIndicator: React.FC = () => {
  const { currentLocation } = useGameState();
  const [showLocationIndicator, setShowLocationIndicator] = useState(false);
  const [previousLocation, setPreviousLocation] = useState<string | null>(null);

  // ATOMIC: Animation Manager for location popup
  const { styles: popupStyles, startAnimation } = useAnimation({
    id: 'location-popup',
    duration: 2500,
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

  // ATOMIC: Location change detection
  useEffect(() => {
    if (currentLocation && currentLocation !== previousLocation) {
      setPreviousLocation(currentLocation);
      setShowLocationIndicator(true);
      
      // Start the animation
      startAnimation();
      
      // Hide after animation completes
      const hideTimer = setTimeout(() => {
        setShowLocationIndicator(false);
      }, 2500);
      
      return () => clearTimeout(hideTimer);
    }
  }, [currentLocation, previousLocation, startAnimation]);

  if (!showLocationIndicator) return null;

  const getLocationName = (location: string) => {
    switch (location) {
      case "LOC_HUB_FIGUREIUM": return "Hub";
      case "LOC_PEACEFUL_FIELDS": return "Fields";
      default: return "Arena";
    }
  };

  return (
    <div 
      className="absolute right-6 pointer-events-auto transition-all duration-200 ease-in-out" 
      style={{ 
        top: '86px', 
        width: '56px',
        opacity: popupStyles.opacity || 0,
        transform: popupStyles.transform as string || 'scale(0.95)',
      }}
    >
      <UIContainer className="px-2 py-1">
        <div className="flex items-center justify-center">
          <span className="text-neutral-100 text-xs font-medium">
            {getLocationName(currentLocation || '')}
          </span>
        </div>
      </UIContainer>
    </div>
  );
};