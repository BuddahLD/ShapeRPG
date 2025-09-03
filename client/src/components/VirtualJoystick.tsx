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
  const isDraggingRef = useRef(false); // For immediate state tracking
  const [currentPosition, setCurrentPosition] = useState<TouchPoint>({ x: 0, y: 0 });
  const currentPositionRef = useRef<TouchPoint>({ x: 0, y: 0 }); // For immediate position tracking
  // movePlayer removed - using event-driven system instead
  const { isDrawingRune } = useGameState();
  const { styles } = useElementLayout('virtualJoystick');

  const joystickRadius = 65;
  const knobRadius = 20;

  // Simple movement state - no game loop needed
  useEffect(() => {
    if (!isDragging) {
      // Notify GameCanvas to stop movement
      window.dispatchEvent(new CustomEvent('joystickStop'));
      return;
    }

    // Notify GameCanvas of movement direction
    const maxDistance = joystickRadius - knobRadius;
    const normalizedX = currentPositionRef.current.x / maxDistance;
    const normalizedY = currentPositionRef.current.y / maxDistance;

    const deadzone = 0.1;
    const magnitude = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    
    if (magnitude < deadzone) {
      window.dispatchEvent(new CustomEvent('joystickStop'));
    } else {
      window.dispatchEvent(new CustomEvent('joystickMove', { 
        detail: { deltaX: normalizedX, deltaY: normalizedY } 
      }));
    }
  }, [isDragging, currentPosition, joystickRadius, knobRadius]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (isDrawingRune || !joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    setCurrentPosition({ x: deltaX, y: deltaY });
    currentPositionRef.current = { x: deltaX, y: deltaY }; // Set ref immediately
    setIsDragging(true);
    isDraggingRef.current = true; // Set ref immediately
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

    // Update current position for continuous movement
    setCurrentPosition({ x: knobX, y: knobY });
    currentPositionRef.current = { x: knobX, y: knobY }; // Set ref immediately

    // Update knob visual position
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
    }
  }, [isDragging, isDrawingRune]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false; // Set ref immediately
    setCurrentPosition({ x: 0, y: 0 });
    currentPositionRef.current = { x: 0, y: 0 }; // Reset ref immediately
    
    // Reset knob position
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
  }, []);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    e.preventDefault();
    const touch = 'touches' in e ? e.touches[0] : (e as TouchEvent).changedTouches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent | TouchEvent) => {
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
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  if (isDrawingRune || isModalOpen) {
    return null; // Hide joystick during rune drawing or when modal is open
  }

  return (
    <div className="pointer-events-auto" style={styles}>
      {/* Joystick Container - Interactive area */}
      <div
        ref={joystickRef}
        className="relative w-32 h-32 rounded-full flex items-center justify-center cursor-pointer"
        onTouchStart={handleTouchStart}
        onMouseDown={handleMouseDown}
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Background Circle - Fixed in center position */}
        <div
          className="absolute rounded-full"
          style={{
            width: knobRadius * 2,
            height: knobRadius * 2,
            minWidth: knobRadius * 2,
            minHeight: knobRadius * 2,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transform: 'translate(0px, 0px)', // Always centered
            pointerEvents: 'none',
          }}
        />
        
        {/* Draggable Knob - Moves with touch/drag */}
        <div
          ref={knobRef}
          className="absolute rounded-full transition-transform duration-300 ease-out"
          style={{
            width: knobRadius * 2,
            height: knobRadius * 2,
            minWidth: knobRadius * 2,
            minHeight: knobRadius * 2,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            transform: 'translate(0px, 0px)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default VirtualJoystick;
