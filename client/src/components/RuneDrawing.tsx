import React, { useRef, useEffect, useState, useCallback } from "react";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
import { useSpellManager } from "../presentation/hooks/useSpellManager";
import { ShapeMatchingService } from "../domain/services/ShapeMatchingService";

interface Point {
  x: number;
  y: number;
}

const RuneDrawing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(true); // Start drawing immediately
  const [points, setPoints] = useState<Point[]>([]);
  const [hasStartedDrawing, setHasStartedDrawing] = useState(false);
  const { setDrawingRune, castSpell } = useGameState();
  const { player } = usePlayer();
  const { getSpellStats } = useSpellManager();
  const shapeMatchingService = new ShapeMatchingService();

  const drawPath = useCallback((ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;

    // Save the current context state
    ctx.save();
    
    // Set drawing properties
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    
    // Restore the context state to prevent affecting other drawings
    ctx.restore();
  }, []);

  const handleStart = useCallback((x: number, y: number) => {
    if (!hasStartedDrawing) {
      setHasStartedDrawing(true);
      setPoints([{ x, y }]);
      
      // Redraw canvas with initial point
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          // Redraw background
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
                 // Redraw instruction text
                 ctx.fillStyle = "#ffffff";
                 ctx.font = "24px Inter";
                 ctx.textAlign = "center";
                 ctx.fillText("Draw a rune to cast a spell", canvasRef.current.width / 2, 50);

                 // TEMPORARY: Show matching is disabled
                 ctx.fillStyle = "#ff0000"; // Red color
                 ctx.font = "bold 18px Inter";
                 ctx.fillText("MATCHING OFF", canvasRef.current.width / 2, 75);

                 ctx.fillStyle = "#ffffff"; // Reset to white
                 ctx.font = "16px Inter";
                 ctx.fillText("Release button to cast", canvasRef.current.width / 2, 100);
          
          // Draw initial point
          ctx.fillStyle = "#00ffff";
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }, [hasStartedDrawing]);

  const handleMove = useCallback((x: number, y: number) => {
    if (!isDrawing || !hasStartedDrawing) return;
    
    setPoints(prev => {
      const newPoints = [...prev, { x, y }];
      
      // Redraw canvas with new points
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Redraw background
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Redraw instruction text
          ctx.fillStyle = "#ffffff";
          ctx.font = "24px Inter";
          ctx.textAlign = "center";
          ctx.fillText("Draw a rune to cast a spell", canvasRef.current.width / 2, 50);
          
          // TEMPORARY: Show matching is disabled
          ctx.fillStyle = "#ff0000"; // Red color
          ctx.font = "bold 18px Inter";
          ctx.fillText("MATCHING OFF", canvasRef.current.width / 2, 75);
          
          ctx.fillStyle = "#ffffff"; // Reset to white
          ctx.font = "16px Inter";
          ctx.fillText("Touch anywhere to start drawing", canvasRef.current.width / 2, 100);
          ctx.fillText("Release button to cast", canvasRef.current.width / 2, 120);
          
          // Draw the path
          drawPath(ctx, newPoints);
        }
      }
      
      return newPoints;
    });
  }, [isDrawing, hasStartedDrawing, drawPath]);

  const handleEnd = useCallback(() => {
    if (!isDrawing || !hasStartedDrawing) {
      setDrawingRune(false);
      return;
    }

    setIsDrawing(false);

    // Only cast spell if we have enough points
    if (points.length >= 3) {
      // Analyze the drawn shape - now any spell can be cast, not just known ones
      const allSpellIds = ['SPL01', 'SPL02', 'SPL03', 'SPL04']; // All available spells
      const matchResult = shapeMatchingService.matchShape(points, allSpellIds);

      if (matchResult.spellId && matchResult.isKnownPattern) {
        // Hide drawing interface immediately
        console.log('🎬 RuneDrawing: Hiding overlay immediately');
        setDrawingRune(false);
        setPoints([]);
        setHasStartedDrawing(false);

        // Dispatch spell cast event to ActionBar after overlay is hidden
        setTimeout(() => {
          console.log('🎬 RuneDrawing: Dispatching spellCast event after 50ms delay');
          const customEvent = new CustomEvent('spellCast', {
            detail: { spellId: matchResult.spellId }
          });
          window.dispatchEvent(customEvent);
        }, 50); // Small delay to ensure overlay is gone
      } else {
        // Apply debuff for failed pattern matching
        castSpell(matchResult);
        setDrawingRune(false);
        setPoints([]);
        setHasStartedDrawing(false);
      }
    } else {
      // Not enough points - just close
      setDrawingRune(false);
      setPoints([]);
      setHasStartedDrawing(false);
    }
  }, [isDrawing, hasStartedDrawing, points, castSpell, setDrawingRune, shapeMatchingService]);


  // Touch events (these are now handled by global events, but keeping for fallback)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default here since we're using global events
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleStart(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't prevent default here since we're using global events
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Don't prevent default here since we're using global events
    handleEnd();
  };

  // Mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't prevent default here since we're using global events
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleStart(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleMove(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    handleEnd();
  };

  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      if (isDrawing && !hasStartedDrawing) {
        // Don't prevent default to avoid conflicts
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          handleStart(e.clientX - rect.left, e.clientY - rect.top);
        }
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDrawing && hasStartedDrawing) {
        // Don't prevent default to avoid conflicts
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          handleMove(e.clientX - rect.left, e.clientY - rect.top);
        }
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDrawing && hasStartedDrawing) {
        // Don't prevent default to avoid conflicts
        handleEnd();
      }
    };

    if (isDrawing) {
      window.addEventListener('mousedown', handleGlobalMouseDown);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        window.removeEventListener('mousedown', handleGlobalMouseDown);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDrawing, hasStartedDrawing, handleStart, handleMove, handleEnd]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Clear canvas with semi-transparent background
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add instruction text
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px Inter";
      ctx.textAlign = "center";
      ctx.fillText("Draw a rune to cast a spell", canvas.width / 2, 50);
      
      // TEMPORARY: Show matching is disabled
      ctx.fillStyle = "#ff0000"; // Red color
      ctx.font = "bold 18px Inter";
      ctx.fillText("MATCHING OFF", canvas.width / 2, 75);
      
      ctx.fillStyle = "#ffffff"; // Reset to white
      ctx.font = "16px Inter";
      ctx.fillText("Touch anywhere to start drawing", canvas.width / 2, 100);
      
      if (hasStartedDrawing) {
        ctx.fillText("Release button to cast", canvas.width / 2, 120);
      }
    }
  }, [hasStartedDrawing]);

  // Listen for rune button press events - just set the drawing state, don't start drawing yet
  useEffect(() => {
    const handleRuneButtonPress = (e: CustomEvent) => {
      // Don't start drawing immediately, wait for user to touch the screen
      // The drawing will start when they actually touch the canvas
    };

    window.addEventListener('runeButtonPress', handleRuneButtonPress as EventListener);
    
    return () => {
      window.removeEventListener('runeButtonPress', handleRuneButtonPress as EventListener);
    };
  }, []);

  // Global touch event listeners for drawing
  useEffect(() => {
    const handleGlobalTouchStart = (e: TouchEvent) => {
      if (isDrawing && !hasStartedDrawing) {
        // Don't prevent default to avoid passive event errors
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          handleStart(touch.clientX - rect.left, touch.clientY - rect.top);
        }
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDrawing && hasStartedDrawing) {
        // Don't prevent default to avoid passive event errors
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
        }
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (isDrawing && hasStartedDrawing) {
        // Don't prevent default to avoid passive event errors
        handleEnd();
      }
    };

    if (isDrawing) {
      window.addEventListener('touchstart', handleGlobalTouchStart, { passive: true });
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
      window.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
      
      return () => {
        window.removeEventListener('touchstart', handleGlobalTouchStart);
        window.removeEventListener('touchmove', handleGlobalTouchMove);
        window.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDrawing, hasStartedDrawing, handleStart, handleMove, handleEnd]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setDrawingRune(false);
      setPoints([]);
      setHasStartedDrawing(false);
    };
  }, [setDrawingRune]);

  return (
    <div className="fixed inset-0 z-30">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default RuneDrawing;
