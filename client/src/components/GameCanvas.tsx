import React, { useRef, useEffect, useCallback } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { usePlayer } from "../lib/stores/usePlayer";
import { GameEngine } from "../lib/gameEngine/GameEngine";

interface GameCanvasProps {
  gameEngine: GameEngine | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameEngine }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const { currentLocation, enemies, isSlowMotion } = useGameState();
  const { player } = usePlayer();

  const gameLoop = useCallback(() => {
    if (!canvasRef.current || !gameEngine) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Apply slow motion effect
    const timeScale = isSlowMotion ? 0.2 : 1.0;
    
    // Update game engine
    gameEngine.update(timeScale);

    // Render game elements
    renderBackground(ctx);
    renderPlayer(ctx);
    renderEnemies(ctx);
    renderEffects(ctx);

    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameEngine, isSlowMotion]);

  const renderBackground = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    
    // Simple gradient background based on location
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    if (currentLocation === "LOC_HUB_FIGUREIUM") {
      gradient.addColorStop(0, "#4a90e2");
      gradient.addColorStop(1, "#7b68ee");
    } else {
      gradient.addColorStop(0, "#8b0000");
      gradient.addColorStop(1, "#ff4500");
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const renderPlayer = (ctx: CanvasRenderingContext2D) => {
    if (!player) return;

    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Player is always centered, world moves around them
    ctx.fillStyle = "#00ff00";
    ctx.strokeStyle = "#004400";
    ctx.lineWidth = 2;
    
    const size = 30;
    ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
    ctx.strokeRect(centerX - size/2, centerY - size/2, size, size);

    // Health bar above player
    const healthBarWidth = 40;
    const healthBarHeight = 4;
    const healthPercentage = player.stats.hp / 100; // Assuming max HP is 100
    
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(centerX - healthBarWidth/2, centerY - size/2 - 10, healthBarWidth, healthBarHeight);
    
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(centerX - healthBarWidth/2, centerY - size/2 - 10, healthBarWidth * healthPercentage, healthBarHeight);

    // Debug: Show player's world coordinates
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.fillText(`Pos: ${player.x.toFixed(0)}, ${player.y.toFixed(0)}`, 10, canvas.height - 20);
    ctx.fillText(`Vel: ${player.vx.toFixed(1)}, ${player.vy.toFixed(1)}`, 10, canvas.height - 40);
  };

  const renderEnemies = (ctx: CanvasRenderingContext2D) => {
    if (!player) return;

    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    enemies.forEach(enemy => {
      // Calculate enemy position relative to player
      const relativeX = enemy.x - player.x;
      const relativeY = enemy.y - player.y;
      
      const screenX = centerX + relativeX;
      const screenY = centerY + relativeY;

      // Only render if on screen
      if (screenX > -50 && screenX < canvas.width + 50 && 
          screenY > -50 && screenY < canvas.height + 50) {
        
        // Draw triangle enemy
        ctx.fillStyle = "#ff4444";
        ctx.strokeStyle = "#aa0000";
        ctx.lineWidth = 2;
        
        const size = enemy.size || 20;
        
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - size);
        ctx.lineTo(screenX - size, screenY + size);
        ctx.lineTo(screenX + size, screenY + size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Health bar
        const healthBarWidth = 30;
        const healthBarHeight = 3;
        const healthPercentage = enemy.hp / enemy.maxHp;
        
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(screenX - healthBarWidth/2, screenY - size - 15, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(screenX - healthBarWidth/2, screenY - size - 15, healthBarWidth * healthPercentage, healthBarHeight);

        // Counterattack indicator
        if (enemy.isAttacking && enemy.counterWindow > 0) {
          const radius = 25;
          const progress = enemy.counterWindow / 1000; // Assuming 1000ms window
          
          ctx.strokeStyle = "#ff0000";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius * progress, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });
  };

  const renderEffects = (ctx: CanvasRenderingContext2D) => {
    // Render spell effects, particles, etc.
    // This will be expanded as needed
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Start game loop
    gameLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full touch-none"
      style={{ touchAction: 'none' }}
    />
  );
};

export default GameCanvas;
