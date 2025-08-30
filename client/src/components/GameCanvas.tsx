import React, { useRef, useEffect, useCallback } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { usePlayer } from "../lib/stores/usePlayer";
import { GameEngine } from "../lib/gameEngine/GameEngine";
import { DesignSystem } from "../lib/services/DesignSystem";
import { VisualEffects } from "../lib/services/VisualEffects";

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
    renderWalls(ctx);
    renderNPCs(ctx);
    renderPlayer(ctx);
    renderEnemies(ctx);
    renderZoneIndicators(ctx);
    renderEffects(ctx);

    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameEngine, isSlowMotion, player, currentLocation, enemies]);

  const renderBackground = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    if (!player) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Zone boundaries in world coordinates
    const hubFieldsBoundary = 200;
    const fieldsArenaBoundary = 600;
    
    // Calculate screen positions of zone boundaries
    const hubFieldsScreenX = centerX + (hubFieldsBoundary - player.x);
    const fieldsArenaScreenX = centerX + (fieldsArenaBoundary - player.x);
    
    // Draw territorial backgrounds based on world coordinates
    
    // Hub territory (violet) - left side
    if (hubFieldsScreenX > 0) {
      const gradient = DesignSystem.createZoneGradient(ctx, 'LOC_HUB_FIGUREIUM', Math.min(hubFieldsScreenX, canvas.width), canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, Math.min(hubFieldsScreenX, canvas.width), canvas.height);
    }
    
    // Peaceful Fields territory (green) - middle section
    const fieldsStartX = Math.max(0, hubFieldsScreenX);
    const fieldsEndX = Math.min(canvas.width, fieldsArenaScreenX);
    if (fieldsEndX > fieldsStartX) {
      const fieldsWidth = fieldsEndX - fieldsStartX;
      const gradient = DesignSystem.createZoneGradient(ctx, 'LOC_PEACEFUL_FIELDS', fieldsWidth, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(fieldsStartX, 0, fieldsWidth, canvas.height);
    }
    
    // Arena territory (brown-red) - right side
    if (fieldsArenaScreenX < canvas.width) {
      const arenaStartX = Math.max(0, fieldsArenaScreenX);
      const arenaWidth = canvas.width - arenaStartX;
      const gradient = DesignSystem.createZoneGradient(ctx, 'LOC_ARENA_1', arenaWidth, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(arenaStartX, 0, arenaWidth, canvas.height);
    }

    // Add subtle grid pattern with modern styling
    ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
    ctx.lineWidth = 0.5;
    
    const gridSize = 50;
    const offsetX = (-player.x % gridSize) + gridSize;
    const offsetY = (-player.y % gridSize) + gridSize;
    
    // Vertical lines
    for (let x = offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const renderPlayer = (ctx: CanvasRenderingContext2D) => {
    if (!player) return;

    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Player with modern cartoon styling
    const size = 30;
    const floatOffset = VisualEffects.createFloatingAnimation(Date.now(), 2);
    
    VisualEffects.drawPlayer(ctx, centerX, centerY + floatOffset, size);
  };

  const renderWalls = (ctx: CanvasRenderingContext2D) => {
    if (!player) return;

    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Use modern neutral colors for walls
    ctx.fillStyle = DesignSystem.COLORS.neutral[600];
    ctx.strokeStyle = DesignSystem.COLORS.neutral[800];
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';

    // Define continuous walls across the entire world
    const allWalls: { x: number; y: number; width: number; height: number }[] = [
      // Continuous top wall across all zones
      { x: -180, y: -130, width: 1160, height: 20 }, // Top wall from hub to arena
      
      // Continuous bottom wall across all zones
      { x: -180, y: 110, width: 1160, height: 20 },  // Bottom wall from hub to arena
      
      // Left boundary wall (hub)
      { x: -180, y: -130, width: 20, height: 260 },  // Hub left wall
      
      // Right boundary wall (arena)
      { x: 980, y: -130, width: 20, height: 260 }   // Arena right wall
    ];

    allWalls.forEach(wall => {
      const screenX = centerX + (wall.x - player.x);
      const screenY = centerY + (wall.y - player.y);
      
      // Only render if visible on screen
      if (screenX > -wall.width && screenX < canvas.width && 
          screenY > -wall.height && screenY < canvas.height) {
        // Draw walls with rounded corners for modern look
        ctx.beginPath();
        ctx.roundRect(screenX, screenY, wall.width, wall.height, 8);
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  const renderNPCs = (ctx: CanvasRenderingContext2D) => {
    if (!player) return;

    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Define NPCs with their world coordinates - render based on visibility
    const npcs = [
      { id: "weapon_shop", x: -80, y: -50, color: DesignSystem.COLORS.secondary[500], label: "⚔️" },
      { id: "armor_shop", x: 80, y: -50, color: DesignSystem.COLORS.success, label: "🛡️" },
      { id: "trainer", x: 0, y: -80, color: DesignSystem.COLORS.primary[500], label: "📚" },
    ];

    npcs.forEach(npc => {
      const screenX = centerX + (npc.x - player.x);
      const screenY = centerY + (npc.y - player.y);

      // Only render if on screen (NPCs are always visible when their area is on screen)
      if (screenX > -30 && screenX < canvas.width + 30 && 
          screenY > -30 && screenY < canvas.height + 30) {
        
        // Add floating animation
        const floatOffset = VisualEffects.createFloatingAnimation(Date.now() + npc.x * 100, 1.5);
        
        // Draw NPC with modern cartoon styling
        VisualEffects.drawNPC(ctx, screenX, screenY + floatOffset, npc.color, npc.label, 22);

        // Draw modern label below
        ctx.save();
        ctx.fillStyle = DesignSystem.COLORS.neutral[50];
        ctx.font = `12px ${DesignSystem.TYPOGRAPHY.fonts.text}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.strokeStyle = DesignSystem.COLORS.neutral[800];
        ctx.lineWidth = 3;
        
        const labels = {
          "weapon_shop": "Weapons",
          "armor_shop": "Armor", 
          "trainer": "Trainer"
        };
        
        const label = labels[npc.id as keyof typeof labels];
        ctx.strokeText(label, screenX, screenY + floatOffset + 30);
        ctx.fillText(label, screenX, screenY + floatOffset + 30);
        ctx.restore();
      }
    });
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
        
        const size = enemy.size || 20;
        
        // Add floating animation for enemies
        const floatOffset = VisualEffects.createFloatingAnimation(Date.now() + enemy.x * 50, 1);
        
        // Draw enemies with modern cartoon styling
        VisualEffects.drawEnemy(
          ctx,
          screenX,
          screenY + floatOffset,
          enemy.type as 'HEX_PEACEFUL' | 'TRI_ARENA',
          size,
          currentLocation
        );

        // Modern enemy health bar
        const healthBarWidth = 32;
        const healthBarHeight = 4;
        const healthPercentage = enemy.hp / enemy.maxHp;
        
        VisualEffects.drawHealthBar(
          ctx,
          screenX,
          screenY + floatOffset - size - 18,
          healthBarWidth,
          healthBarHeight,
          healthPercentage
        );

        // Modern counterattack indicator
        if (enemy.isAttacking && enemy.counterWindow > 0) {
          const radius = 28;
          const progress = enemy.counterWindow / 1000;
          
          ctx.save();
          VisualEffects.applyMagicalGlow(ctx, 'fire');
          
          ctx.strokeStyle = DesignSystem.COLORS.error;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(screenX, screenY + floatOffset, radius, 0, Math.PI * 2 * progress);
          ctx.stroke();
          
          DesignSystem.resetCanvasStyle(ctx);
          ctx.restore();
        }
      }
    });
  };

  const renderZoneIndicators = (ctx: CanvasRenderingContext2D) => {
    if (!player) return;
    
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Modern zone transition lines
    ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 12]);
    
    // Hub → Fields transition at x=200
    const hubFieldsLine = centerX + (200 - player.x);
    if (hubFieldsLine > -50 && hubFieldsLine < canvas.width + 50) {
      ctx.beginPath();
      ctx.moveTo(hubFieldsLine, 0);
      ctx.lineTo(hubFieldsLine, canvas.height);
      ctx.stroke();
    }
    
    // Fields → Arena transition at x=600
    const fieldsArenaLine = centerX + (600 - player.x);
    if (fieldsArenaLine > -50 && fieldsArenaLine < canvas.width + 50) {
      ctx.beginPath();
      ctx.moveTo(fieldsArenaLine, 0);
      ctx.lineTo(fieldsArenaLine, canvas.height);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
    
    // Zone name now handled by HUD component
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
