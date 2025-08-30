import React, { useRef, useEffect, useState, useCallback } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { usePlayer } from "../lib/stores/usePlayer";
import { ShapeMatching } from "../lib/gameEngine/ShapeMatching";

interface Point {
  x: number;
  y: number;
}

const RuneDrawing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const { setDrawingRune, castSpell } = useGameState();
  const { player } = usePlayer();

  const drawPath = useCallback((ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;

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
  }, []);

  const handleStart = useCallback((x: number, y: number) => {
    setIsDrawing(true);
    setPoints([{ x, y }]);
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    if (!isDrawing) return;
    
    setPoints(prev => [...prev, { x, y }]);
    
    // Redraw canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawPath(ctx, [...points, { x, y }]);
      }
    }
  }, [isDrawing, points, drawPath]);

  const handleEnd = useCallback(() => {
    if (!isDrawing || points.length < 3) {
      setDrawingRune(false);
      return;
    }

    setIsDrawing(false);

    // Analyze the drawn shape
    const shapeMatching = new ShapeMatching();
    const matchResult = shapeMatching.matchShape(points, player?.spells || []);
    
    // Cast spell or apply debuff based on match
    castSpell(matchResult);
    
    // Clear drawing after a short delay
    setTimeout(() => {
      setDrawingRune(false);
      setPoints([]);
    }, 500);
  }, [isDrawing, points, castSpell, setDrawingRune, player]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleStart(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleStart(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      handleMove(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDrawing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDrawing]);

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
      
      ctx.font = "16px Inter";
      ctx.fillText("Release to cast", canvas.width / 2, 80);
    }
  }, []);

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
      />
    </div>
  );
};

export default RuneDrawing;
