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
    
    // Zone-based background that changes as you move through the world
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    if (currentLocation === "LOC_HUB_FIGUREIUM") {
      // Blue hub colors
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(0.5, "#16213e");
      gradient.addColorStop(1, "#0f3460");
    } else if (currentLocation === "LOC_PEACEFUL_FIELDS") {
      // Green field colors
      gradient.addColorStop(0, "#2d5016");
      gradient.addColorStop(0.5, "#4a7c59");
      gradient.addColorStop(1, "#1a3d0a");
    } else if (currentLocation === "LOC_ARENA_1") {
      // Brown arena colors
      gradient.addColorStop(0, "#5d2e0a");
      gradient.addColorStop(0.5, "#8b4513");
      gradient.addColorStop(1, "#3d1a06");
    } else {
      // Default colors
      gradient.addColorStop(0, "#4a90e2");
      gradient.addColorStop(1, "#7b68ee");
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add grid pattern to show movement
    if (player) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      
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
    }
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


    // Show movement indicator
    if (Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1) {
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(centerX, centerY - 50, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Pulsing effect
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 50, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const renderWalls = (ctx: CanvasRenderingContext2D) => {
    if (!player) return;

    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.fillStyle = "#8B4513";
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;

    // Define walls that match collision system with openings
    let walls: { x: number; y: number; width: number; height: number }[] = [];
    
    // Hub walls with left wall but open to east
    if (player.x >= -200 && player.x <= 200) {
      walls.push(
        { x: -180, y: -130, width: 360, height: 20 }, // Top wall
        { x: -180, y: 110, width: 360, height: 20 },  // Bottom wall
        { x: -180, y: -130, width: 20, height: 260 }   // Left wall
      );
    }
    
    // Fields walls (open on both sides for transitions)
    if (player.x >= 200 && player.x <= 600) {
      walls.push(
        { x: 200, y: -130, width: 400, height: 20 }, // Top wall
        { x: 200, y: 110, width: 400, height: 20 }   // Bottom wall
      );
    }
    
    // Arena walls with right wall but open to west
    if (player.x >= 600 && player.x <= 1000) {
      walls.push(
        { x: 620, y: -130, width: 360, height: 20 }, // Top wall
        { x: 620, y: 110, width: 360, height: 20 },  // Bottom wall
        { x: 980, y: -130, width: 20, height: 260 }  // Right wall
      );
    }

    walls.forEach(wall => {
      const screenX = centerX + (wall.x - player.x);
      const screenY = centerY + (wall.y - player.y);
      
      // Only render if visible on screen
      if (screenX > -wall.width && screenX < canvas.width && 
          screenY > -wall.height && screenY < canvas.height) {
        ctx.fillRect(screenX, screenY, wall.width, wall.height);
        ctx.strokeRect(screenX, screenY, wall.width, wall.height);
      }
    });
  };

  const renderNPCs = (ctx: CanvasRenderingContext2D) => {
    if (currentLocation !== "LOC_HUB_FIGUREIUM" || !player) return;

    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Only show NPCs in the hub area
    if (currentLocation !== "LOC_HUB_FIGUREIUM") return;
    
    // Define NPCs with fixed world positions (only in hub)
    const npcs = [
      { id: "weapon_shop", x: -80, y: -50, color: "#4169E1", label: "⚔️" },
      { id: "armor_shop", x: 80, y: -50, color: "#32CD32", label: "🛡️" },
      { id: "trainer", x: 0, y: -80, color: "#9932CC", label: "📚" },
    ];

    npcs.forEach(npc => {
      const screenX = centerX + (npc.x - player.x);
      const screenY = centerY + (npc.y - player.y);

      // Only render if on screen
      if (screenX > -30 && screenX < canvas.width + 30 && 
          screenY > -30 && screenY < canvas.height + 30) {
        
        // Draw NPC as a colored circle
        ctx.fillStyle = npc.color;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw icon in center
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(npc.label, screenX, screenY);

        // Draw label below
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const labels = {
          "weapon_shop": "Weapons",
          "armor_shop": "Armor", 
          "trainer": "Trainer"
        };
        ctx.fillText(labels[npc.id as keyof typeof labels], screenX, screenY + 25);
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
        
        // Draw different shapes based on enemy type
        if (enemy.type === "HEX_PEACEFUL") {
          // Draw hexagon for peaceful field enemies
          ctx.fillStyle = "#ff8844";
          ctx.strokeStyle = "#cc5500";
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = screenX + Math.cos(angle) * size;
            const y = screenY + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // Draw triangle for arena enemies
          ctx.fillStyle = "#ff4444";
          ctx.strokeStyle = "#aa0000";
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          ctx.moveTo(screenX, screenY - size);
          ctx.lineTo(screenX - size, screenY + size);
          ctx.lineTo(screenX + size, screenY + size);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

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

  const renderZoneIndicators = (ctx: CanvasRenderingContext2D) => {
    if (!player) return;
    
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Zone transition lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    
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
    
    // Zone name overlay
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    let zoneName = "";
    if (currentLocation === "LOC_HUB_FIGUREIUM") {
      zoneName = "Figureium Hub";
    } else if (currentLocation === "LOC_PEACEFUL_FIELDS") {
      zoneName = "Peaceful Fields";
    } else if (currentLocation === "LOC_ARENA_1") {
      zoneName = "Combat Arena";
    }
    
    if (zoneName) {
      ctx.fillText(zoneName, canvas.width / 2, 20);
    }
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
