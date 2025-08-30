import React, { useRef, useEffect, useState, useCallback } from "react";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGameState } from "../lib/stores/useGameState";

interface TouchPoint {
  x: number;
  y: number;
}

const VirtualJoystick: React.FC = () => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState<TouchPoint>({ x: 0, y: 0 });
  const { movePlayer } = usePlayer();
  const { isDrawingRune } = useGameState();

  const joystickRadius = 50;
  const knobRadius = 20;

  const updateMovement = useCallback((deltaX: number, deltaY: number) => {
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = joystickRadius - knobRadius;
    
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }

    const normalizedX = deltaX / maxDistance;
    const normalizedY = deltaY / maxDistance;

    
    movePlayer(normalizedX, normalizedY);
  }, [movePlayer, joystickRadius, knobRadius]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (isDrawingRune) return; // Disable joystick during rune drawing
    
    setIsDragging(true);
    setTouchStart({ x: clientX, y: clientY });
  }, [isDrawingRune]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || isDrawingRune) return;

    const deltaX = clientX - touchStart.x;
    const deltaY = clientY - touchStart.y;

    // Update knob position
    if (knobRef.current) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = joystickRadius - knobRadius;
      
      let knobX = deltaX;
      let knobY = deltaY;
      
      if (distance > maxDistance) {
        knobX = (deltaX / distance) * maxDistance;
        knobY = (deltaY / distance) * maxDistance;
      }
      
      knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;
    }

    updateMovement(deltaX, deltaY);
  }, [isDragging, isDrawingRune, touchStart, updateMovement]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    movePlayer(0, 0); // Stop movement
    
    // Reset knob position
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
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

  if (isDrawingRune) {
    return null; // Hide joystick during rune drawing
  }

  return (
    <div
      ref={joystickRef}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      style={{
        width: joystickRadius * 2,
        height: joystickRadius * 2,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
      }}
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
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default VirtualJoystick;
