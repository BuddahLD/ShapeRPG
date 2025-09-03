import React, { useRef, useEffect, useCallback } from "react";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
// GameEngine removed - using clean architecture instead
import { DesignSystem } from "../lib/services/DesignSystem";
import { VisualEffects } from "../lib/services/VisualEffects";
// WorldAreaManager removed - using clean architecture game state instead

interface GameCanvasProps {
  // No props needed - using clean architecture hooks
}

const GameCanvas: React.FC<GameCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const { currentLocation, enemies, isSlowMotion, gameState } = useGameState();
  const { player, position } = usePlayer();

  // Debug logging
  console.log('GameCanvas render:', { 
    currentLocation, 
    enemies: enemies?.length, 
    isSlowMotion, 
    player: !!player 
  });

  const gameLoop = useCallback(() => {
    if (!canvasRef.current) {
      console.log('GameCanvas: Missing canvas');
      return;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) {
      console.log('GameCanvas: Could not get 2D context');
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Apply slow motion effect
    const timeScale = isSlowMotion ? 0.2 : 1.0;
    
    // Game engine removed - using clean architecture instead

    // Render game elements
    renderBackground(ctx);
    handleBoundaryLimits();
    renderNPCs(ctx);
    renderPlayer(ctx);
    renderEnemies(ctx);
    renderZoneIndicators(ctx);
    renderEffects(ctx);

    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isSlowMotion, player, currentLocation, enemies]);

  const renderBackground = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    if (!player) return;
    
    const centerX = canvas.width / 2;
    
    // Use current area from clean architecture game state
    const currentArea = gameState.currentArea;
    
    // Debug: Log area detection (only once)
    if (currentArea && !(window as any).areaLogged) {
      console.log('Current area detected:', {
        id: currentArea.id,
        name: currentArea.name,
        primary: currentArea.visualTheme.primary,
        secondary: currentArea.visualTheme.secondary
      });
      (window as any).areaLogged = true;
    }
    
    if (currentArea) {
      // Use the same color as shown in minimap for consistency
      ctx.fillStyle = currentArea.backgroundGradient || currentArea.visualTheme.primary;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Default background if no area
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    // Use player position or fallback to position from hook
    const playerPos = player?.position || position;
    if (!playerPos) return;

    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Player is always rendered at center (camera follows player)
    // The world moves around the player, not the player around the world
    const size = 30;
    
    VisualEffects.drawPlayer(ctx, centerX, centerY, size);
  };

  // Invisible boundary system - no visual walls but movement limits
  const handleBoundaryLimits = () => {
    const playerPos = player?.position || position;
    if (!playerPos) return;
    
    // Define world boundaries (keep movement constraints without visual walls)
    const worldBounds = {
      minX: -160,
      maxX: 2560, 
      minY: -110,
      maxY: 90
    };
    
    // These boundaries are enforced in the player movement system
    // No visual rendering needed - just natural zone transitions
  };

  const renderNPCs = (ctx: CanvasRenderingContext2D) => {
    // Use player position or fallback to position from hook
    const playerPos = player?.position || position;
    if (!playerPos) return;

    // Debug: Log player position every 300 frames (once per 5 seconds at 60fps)
    if (Math.random() < 0.003) { // ~1/300 chance
      console.log('GameCanvas renderNPCs - Player position:', playerPos);
    }

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
      const screenX = centerX + (npc.x - playerPos.x);
      const screenY = centerY + (npc.y - playerPos.y);

      // Only render if on screen (NPCs are always visible when their area is on screen)
      if (screenX > -30 && screenX < canvas.width + 30 && 
          screenY > -30 && screenY < canvas.height + 30) {
        
        // Draw NPC with modern cartoon styling
        VisualEffects.drawNPC(ctx, screenX, screenY, npc.color, npc.label, 22);

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
        ctx.strokeText(label, screenX, screenY + 30);
        ctx.fillText(label, screenX, screenY + 30);
        ctx.restore();
      }
    });
  };

  const renderEnemies = (ctx: CanvasRenderingContext2D) => {
    if (!player) return;

    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    enemies.forEach((enemy: any) => {
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

        // Enemy info moved to minimap - no health bars or indicators on canvas
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
