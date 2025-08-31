import React, { useRef, useEffect, useState, useCallback } from "react";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { useElementLayout } from "../presentation/hooks/useUILayout";

interface TouchPoint {
  x: number;
  y: number;
}

interface VirtualJoystickProps {
  isModalOpen?: boolean;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ isModalOpen = false }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<TouchPoint>({ x: 0, y: 0 });
  const { movePlayer } = usePlayer();
  const { isDrawingRune } = useGameState();
  const { styles } = useElementLayout('virtualJoystick');

  const joystickRadius = 65;
  const knobRadius = 20;

  // Continuous movement loop
  useEffect(() => {
    if (!isDragging) return;

    const gameLoop = () => {
      const maxDistance = joystickRadius - knobRadius;
      const normalizedX = currentPosition.x / maxDistance;
      const normalizedY = currentPosition.y / maxDistance;

      const deadzone = 0.1;
      const magnitude = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
      
      console.log('CONTINUOUS MOVEMENT - POS:', currentPosition.x.toFixed(1), currentPosition.y.toFixed(1), 'NORM:', normalizedX.toFixed(2), normalizedY.toFixed(2), 'MAG:', magnitude.toFixed(2));
      
      if (magnitude < deadzone) {
        console.log('DEADZONE - STOPPING');
        movePlayer(0, 0);
      } else {
        console.log('CONTINUOUS MOVE:', normalizedX.toFixed(2), normalizedY.toFixed(2));
        movePlayer(normalizedX, normalizedY);
      }
    };

    // Run movement loop at 60fps
    const interval = setInterval(gameLoop, 16);
    return () => clearInterval(interval);
  }, [isDragging, currentPosition, movePlayer, joystickRadius, knobRadius]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (isDrawingRune || !joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    console.log('JOYSTICK START - Center:', centerX.toFixed(1), centerY.toFixed(1), 'Touch:', clientX.toFixed(1), clientY.toFixed(1), 'Initial Delta:', deltaX.toFixed(1), deltaY.toFixed(1));
    
    setCurrentPosition({ x: deltaX, y: deltaY });
    setIsDragging(true);
  }, [isDrawingRune]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || isDrawingRune || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = joystickRadius - knobRadius;
    
    let knobX = deltaX;
    let knobY = deltaY;
    
    if (distance > maxDistance) {
      knobX = (deltaX / distance) * maxDistance;
      knobY = (deltaY / distance) * maxDistance;
    }

    console.log('RAW DELTA:', deltaX.toFixed(1), deltaY.toFixed(1), 'CONSTRAINED:', knobX.toFixed(1), knobY.toFixed(1), 'DISTANCE:', distance.toFixed(1));

    // Update current position for continuous movement
    setCurrentPosition({ x: knobX, y: knobY });

    // Update knob visual position
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
    }
  }, [isDragging, isDrawingRune]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setCurrentPosition({ x: 0, y: 0 });
    movePlayer(0, 0);
    
    // Reset knob position
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    
    console.log('JOYSTICK END - Movement stopped');
  }, [movePlayer]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (isDrawingRune || isModalOpen) {
    return null; // Hide joystick during rune drawing or when modal is open
  }

  return (
    <div className="pointer-events-auto" style={styles}>
      <div
        className="backdrop-blur-md bg-white/20 rounded-full border border-white/30 shadow-lg w-22 h-22 flex items-center justify-center transition-all duration-300 hover:bg-white/30"
        style={{ touchAction: 'none', boxSizing: 'border-box' }}
      >
        <div
          ref={joystickRef}
          className="relative w-full h-full rounded-full flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div
            ref={knobRef}
            style={{
              width: knobRadius * 2,
              height: knobRadius * 2,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, rgba(245, 245, 244, 0.9), rgba(245, 245, 244, 0.7))',
              border: '1px solid rgba(245, 245, 244, 0.8)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(245, 245, 244, 0.8)',
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VirtualJoystick;
