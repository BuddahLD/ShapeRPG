import React, { useEffect, useState, useRef } from "react";
import { useGameState } from "../../presentation/hooks/useGameStateManager";
import { useElementLayout } from "../../presentation/hooks/useUILayout";
import { useCastingService } from "../../presentation/hooks/useCastingService";
import { SparkleParticles } from "./SparkleParticles";

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
  const { castingState, startCasting } = useCastingService();
  const [castingProgress, setCastingProgress] = useState(0);

  // Log when castingProgress changes (only key milestones)
  useEffect(() => {
    if (castingProgress > 0 && (castingProgress % 25 < 1 || castingProgress > 99)) {
      console.log('🎬 ActionBar: castingProgress updated to:', Math.round(castingProgress) + '%');
    }
  }, [castingProgress]);
  const animationRef = useRef<number | null>(null);

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
    // Don't close the drawing interface here - let RuneDrawing component handle it
    // setDrawingRune(false);
  };

  // Listen for spell casting events from RuneDrawing
  useEffect(() => {
    const handleSpellCast = (e: CustomEvent) => {
      const now = performance.now();
      console.log('🎬 ActionBar: Received spellCast event at', now);
      if (e.detail.timestamp) {
        console.log('🎬 ActionBar: Event latency:', now - e.detail.timestamp, 'ms');
      }
      console.log('🎬 ActionBar: Received spellCast event payload:', e.detail);
      const { spellId } = e.detail;
      if (spellId) {
        console.log('🎬 ActionBar: Calling startCasting with spellId:', spellId);
        startCasting(spellId);
      }
    };

    window.addEventListener('spellCast', handleSpellCast as EventListener);
    return () => {
      window.removeEventListener('spellCast', handleSpellCast as EventListener);
    };
  }, [startCasting]);

  // Handle casting progress animation
  useEffect(() => {
    if (castingState.isCasting) {
      console.log('🎬 ActionBar: Animation starting - castingState.isCasting = true');
      // Start animation immediately when casting begins
      setCastingProgress(0);

      const startTime = performance.now();
      const castTime = 3000; // 3 seconds for SPL01

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / castTime, 1);

        setCastingProgress(progress * 100);

        // Log first frame to confirm animation started
        if (elapsed < 20) {
          console.log('🎬 ActionBar: Animation started - elapsed:', Math.round(elapsed) + 'ms, progress:', Math.round(progress * 100) + '%');
        }

        // Sample log every ~500ms to check smoothness
        if (Math.floor(elapsed) % 500 < 20) {
          console.log('🎬 ActionBar: Animation frame - elapsed:', Math.round(elapsed), 'progress:', progress.toFixed(2));
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          console.log('🎬 ActionBar: Animation completed at', performance.now());
        }
      };

      // Start animation immediately, no delay
      console.log('🎬 ActionBar: Starting animation loop');
      animationRef.current = requestAnimationFrame(animate);
    } else {
      console.log('🎬 ActionBar: Animation stopped - castingState.isCasting = false');
      setCastingProgress(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [castingState.isCasting]);

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
          const isCastingButton = isRuneButton && castingState.isCasting;
          const containerClasses = isRuneButton
            ? `backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-full ${size} flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 ${shouldHideRuneButton ? 'opacity-0 pointer-events-none' : ''} relative`
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
                className="w-full h-full rounded-full text-white font-semibold text-lg flex items-center justify-center transition-all duration-200 relative"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation',
                  pointerEvents: isRuneButton ? 'auto' : 'auto'
                }}
                title={action.label}
              >
                {action.icon}

                {/* Casting animation - thin inner border progress */}
                {isRuneButton && isCastingButton && (
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      zIndex: 10
                    }}
                  >
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 40 40"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center'
                      }}
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        fill="none"
                        stroke="#00ffff"
                        strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 18}`}
                        strokeDashoffset={`${2 * Math.PI * 18 * (castingProgress / 100)}`}
                        strokeLinecap="round"
                        style={{
                          filter: 'drop-shadow(0 0 2px #00ffff)'
                        }}
                      />
                    </svg>
                    <SparkleParticles progress={castingProgress} size={40} />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};