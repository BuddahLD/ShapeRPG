import React, { useRef, useEffect, useCallback } from "react";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
// GameEngine removed - using clean architecture instead
import { DesignSystem } from "../lib/services/DesignSystem";
import { VisualEffects } from "../lib/services/VisualEffects";
import { EnemyRenderer } from "./EnemyRenderer";
// WorldAreaManager removed - using clean architecture game state instead

interface GameCanvasProps {
  // No props needed - using clean architecture hooks
}

// GAME ENGINE - Completely separate from React rendering cycle
class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private isRunning = false;
  
  // Game state refs - updated from React but used independently
  private gameState = {
    isSlowMotion: false,
    player: null as any,
    currentLocation: 'LOC_HUB_FIGUREIUM',
    enemies: [] as any[],
    detectZoneChange: null as any
  };
  
  // Local game state
  private localPlayerPosition = { x: 0, y: 0 };
  private movementVelocity = { x: 0, y: 0 };
  private isMoving = false;
  
  // Performance monitoring
  private stats = {
    frameCount: 0,
    lastFrameTime: 0,
    errorCount: 0,
    isHealthy: true,
    performanceScore: 100
  };
  
  private config = {
    maxErrors: 5,
    errorRecoveryTime: 1000,
    performanceThreshold: 16.67, // 60fps
    maxFrameSkip: 3
  };

  // Initialize the game engine
  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.isRunning = true;
    this.startGameLoop();
  }

  // Update game state from React (called when React state changes)
  updateGameState(newState: any) {
    this.gameState = { ...this.gameState, ...newState };
  }

  // Start the game loop
  private startGameLoop() {
    if (!this.isRunning) return;
    this.gameLoop();
  }

  // Main game loop - completely independent of React
  private gameLoop = () => {
    const startTime = performance.now();
    
    try {
      if (!this.canvas || !this.ctx || !this.isRunning) {
        return;
      }

      // Update frame statistics
      this.stats.frameCount++;
      const deltaTime = startTime - this.stats.lastFrameTime;
      this.stats.lastFrameTime = startTime;

      // Performance monitoring
      if (deltaTime > this.config.performanceThreshold) {
        this.stats.performanceScore = Math.max(0, this.stats.performanceScore - 1);
      } else {
        this.stats.performanceScore = Math.min(100, this.stats.performanceScore + 0.5);
      }

      // Update player position
      if (this.isMoving) {
        this.localPlayerPosition.x += this.movementVelocity.x;
        this.localPlayerPosition.y += this.movementVelocity.y;
      }

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Render game elements
      this.renderBackground();
      this.renderNPCs();
      this.renderPlayer();
      this.renderEnemies();
      this.renderZoneIndicators();

      // Reset error count on successful frame
      this.stats.errorCount = 0;
      this.stats.isHealthy = true;

    } catch (error) {
      console.error('GameEngine: Error in game loop', error);
      this.stats.errorCount++;
      this.stats.isHealthy = false;

      // Auto-recovery
      if (this.stats.errorCount >= this.config.maxErrors) {
        console.error('GameEngine: Too many errors, stopping game loop');
        this.stop();
        return;
      }
    }

    // Continue game loop
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  };

  // Render methods - Restored from original with proper game engine architecture
  private renderBackground() {
    if (!this.ctx || !this.canvas) return;
    
    const canvas = this.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Zone colors and bounds (matching zone indicators)
    const zones = [
      {
        name: 'hub',
        color: '#8b5cf6',      // violet
        bounds: { minX: -200, maxX: 200, minY: -150, maxY: 150 }
      },
      {
        name: 'fields', 
        color: '#10b981',     // green
        bounds: { minX: 200, maxX: 600, minY: -150, maxY: 150 }
      },
      {
        name: 'shards',
        color: '#dc2626',     // red
        bounds: { minX: 600, maxX: 1100, minY: -450, maxY: 450 }
      },
      {
        name: 'nowhere',
        color: '#6b7280',     // gray
        bounds: { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity }
      }
    ];
    
    // Clear canvas with default background
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render zone backgrounds based on what's visible on screen
    zones.forEach(zone => {
      // Skip the "nowhere" zone - it uses the default background
      if (zone.name === 'nowhere') return;
      
      const bounds = zone.bounds;
      
      // Calculate screen positions for zone boundaries
      const left = centerX + (bounds.minX - this.localPlayerPosition.x);
      const right = centerX + (bounds.maxX - this.localPlayerPosition.x);
      const top = centerY + (bounds.minY - this.localPlayerPosition.y);
      const bottom = centerY + (bounds.maxY - this.localPlayerPosition.y);
      
      // Only render if zone is visible on screen
      if (right > 0 && left < canvas.width && bottom > 0 && top < canvas.height) {
        // Clamp to screen bounds
        const renderLeft = Math.max(0, left);
        const renderRight = Math.min(canvas.width, right);
        const renderTop = Math.max(0, top);
        const renderBottom = Math.min(canvas.height, bottom);
        
        // Render zone background with low opacity for subtle effect
        this.ctx.fillStyle = `${zone.color}20`; // 12.5% opacity
        this.ctx.fillRect(renderLeft, renderTop, renderRight - renderLeft, renderBottom - renderTop);
      }
    });

    // Add subtle grid pattern with modern styling
    this.ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
    this.ctx.lineWidth = 0.5;
    
    const gridSize = 50;
    const offsetX = (-this.localPlayerPosition.x % gridSize) + gridSize;
    const offsetY = (-this.localPlayerPosition.y % gridSize) + gridSize;
    
    // Vertical lines
    for (let x = offsetX; x < canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = offsetY; y < canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(canvas.width, y);
      this.ctx.stroke();
    }
  }

  private renderPlayer() {
    if (!this.ctx || !this.canvas) return;
    
    const canvas = this.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Player is always rendered at center (camera follows player)
    const size = 30;
    
    // Original blue square player with contour and highlight
    this.renderPlayerWithOriginalDesign(centerX, centerY, size);
  }

  private renderPlayerWithOriginalDesign(x: number, y: number, size: number) {
    if (!this.ctx) return;
    
    // Draw square with contour (original design)
    this.ctx.beginPath();
    this.ctx.rect(x - size/2, y - size/2, size, size);
    
    // Fill with modern blue
    this.ctx.fillStyle = '#60a5fa'; // DesignSystem.COLORS.primary[400]
    this.ctx.fill();
    
    // Add darker blue outline
    this.ctx.strokeStyle = '#1e40af'; // DesignSystem.COLORS.primary[800]
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // Add highlight for 3D effect
    this.ctx.save();
    this.ctx.fillStyle = '#dbeafe'; // DesignSystem.COLORS.primary[200]
    this.ctx.globalAlpha = 0.6;
    this.ctx.fillRect(x - size/2 + 2, y - size/2 + 2, size - 10, 8);
    this.ctx.restore();
  }

  private renderNPCs() {
    if (!this.ctx || !this.canvas) return;
    
    const canvas = this.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Define NPCs with their world coordinates
    const npcs = [
      { id: "weapon_shop", x: -80, y: -50, color: '#8b5cf6', label: "⚔️" },
      { id: "armor_shop", x: 80, y: -50, color: '#10b981', label: "🛡️" },
      { id: "trainer", x: 0, y: -80, color: '#f59e0b', label: "📚" },
    ];

    npcs.forEach(npc => {
      const screenX = centerX + (npc.x - this.localPlayerPosition.x);
      const screenY = centerY + (npc.y - this.localPlayerPosition.y);

      // Only render if on screen
      if (screenX > -30 && screenX < canvas.width + 30 && 
          screenY > -30 && screenY < canvas.height + 30) {
        
        // Draw NPC with modern styling
        this.renderNPC(screenX, screenY, npc.color, npc.label, 22);

        // Draw label below
        this.ctx!.save();
        this.ctx!.fillStyle = '#ffffff';
        this.ctx!.font = '12px Inter, sans-serif';
        this.ctx!.textAlign = 'center';
        this.ctx!.textBaseline = 'top';
        this.ctx!.strokeStyle = '#000000';
        this.ctx!.lineWidth = 3;
        
        const labels = {
          "weapon_shop": "Weapons",
          "armor_shop": "Armor", 
          "trainer": "Trainer"
        };
        
        const label = labels[npc.id as keyof typeof labels];
        this.ctx!.strokeText(label, screenX, screenY + 30);
        this.ctx!.fillText(label, screenX, screenY + 30);
        this.ctx!.restore();
      }
    });
  }

  private renderNPC(x: number, y: number, color: string, emoji: string, size: number) {
    if (!this.ctx) return;
    
    // NPC body
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    
    // NPC emoji
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(emoji, x, y);
  }

  private renderEnemies() {
    if (!this.ctx || !this.canvas) return;
    
    const canvas = this.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    this.gameState.enemies.forEach((enemy: any) => {
      const screenX = centerX + (enemy.x - this.localPlayerPosition.x);
      const screenY = centerY + (enemy.y - this.localPlayerPosition.y);

      // Only render if on screen
      if (screenX > -50 && screenX < canvas.width + 50 && 
          screenY > -50 && screenY < canvas.height + 50) {
        
        const size = enemy.size || 20;
        this.renderEnemy(screenX, screenY, enemy.type, size);
      }
    });
  }

  private renderEnemy(x: number, y: number, type: string, size: number) {
    if (!this.ctx) return;
    
    // Add floating animation
    const floatOffset = Math.sin(Date.now() * 0.003 + x * 0.01) * 2;
    
    if (type === 'HEX_PEACEFUL') {
      // Hexagonal enemy
      this.ctx.fillStyle = '#ff6b6b';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + Math.cos(angle) * size;
        const py = y + floatOffset + Math.sin(angle) * size;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    } else {
      // Triangular enemy
      this.ctx.fillStyle = '#ff4757';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + floatOffset - size);
      this.ctx.lineTo(x - size, y + floatOffset + size);
      this.ctx.lineTo(x + size, y + floatOffset + size);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }
  }

  private renderZoneIndicators() {
    if (!this.ctx || !this.canvas) return;
    
    const canvas = this.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Zone colors (matching minimap)
    const zoneColors = {
      hub: '#8b5cf6',      // violet
      fields: '#10b981',   // green
      shards: '#dc2626',   // red
      nowhere: '#6b7280'   // gray
    };
    
    // Zone boundaries
    const zoneBounds = {
      hub: { minX: -200, maxX: 200, minY: -150, maxY: 150 },
      fields: { minX: 200, maxX: 600, minY: -150, maxY: 150 },
      shards: { minX: 600, maxX: 1100, minY: -450, maxY: 450 },
      nowhere: { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity }
    };
    
    // Render zone boundary boxes
    Object.entries(zoneBounds).forEach(([zoneName, bounds]) => {
      // Skip the "nowhere" zone - it has infinite bounds
      if (zoneName === 'nowhere') return;
      
      const color = zoneColors[zoneName as keyof typeof zoneColors];
      
      // Calculate screen positions for zone boundaries
      const left = centerX + (bounds.minX - this.localPlayerPosition.x);
      const right = centerX + (bounds.maxX - this.localPlayerPosition.x);
      const top = centerY + (bounds.minY - this.localPlayerPosition.y);
      const bottom = centerY + (bounds.maxY - this.localPlayerPosition.y);
      
      // Only render if zone is visible on screen
      if (right > 0 && left < canvas.width && bottom > 0 && top < canvas.height) {
        // Zone boundary box
        this.ctx.strokeStyle = `${color}80`; // 50% opacity
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([4, 8]);
        
        this.ctx.beginPath();
        this.ctx.rect(left, top, right - left, bottom - top);
        this.ctx.stroke();
        
        // Zone corner markers
        this.ctx.fillStyle = color;
        this.ctx.setLineDash([]);
        
        // Corner squares (8x8 pixels)
        const cornerSize = 8;
        this.ctx.fillRect(left - cornerSize/2, top - cornerSize/2, cornerSize, cornerSize);
        this.ctx.fillRect(right - cornerSize/2, top - cornerSize/2, cornerSize, cornerSize);
        this.ctx.fillRect(left - cornerSize/2, bottom - cornerSize/2, cornerSize, cornerSize);
        this.ctx.fillRect(right - cornerSize/2, bottom - cornerSize/2, cornerSize, cornerSize);
      }
    });
    
    // Zone transition lines (enhanced)
    this.ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([12, 8]);
    
    // Hub → Fields transition at x=200
    const hubFieldsLine = centerX + (200 - this.localPlayerPosition.x);
    if (hubFieldsLine > -50 && hubFieldsLine < canvas.width + 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(hubFieldsLine, 0);
      this.ctx.lineTo(hubFieldsLine, canvas.height);
      this.ctx.stroke();
    }
    
    // Fields → Shards transition at x=600
    const fieldsShardsLine = centerX + (600 - this.localPlayerPosition.x);
    if (fieldsShardsLine > -50 && fieldsShardsLine < canvas.width + 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(fieldsShardsLine, 0);
      this.ctx.lineTo(fieldsShardsLine, canvas.height);
      this.ctx.stroke();
    }
    
    this.ctx.setLineDash([]);
  }

  // Handle joystick movement
  handleJoystickMove(deltaX: number, deltaY: number) {
    this.movementVelocity = { 
      x: deltaX * 1.6,
      y: deltaY * 1.6 
    };
    this.isMoving = true;
  }

  handleJoystickStop() {
    this.movementVelocity = { x: 0, y: 0 };
    this.isMoving = false;
  }

  // Stop the game engine
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Get performance stats
  getStats() {
    return { ...this.stats };
  }

  // Get current player position
  getPlayerPosition() {
    return { ...this.localPlayerPosition };
  }
}

// Global game engine instance
const gameEngine = new GameEngine();

const GameCanvas: React.FC<GameCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentLocation, enemies, isSlowMotion, gameState, detectZoneChange } = useGameState();
  const { player, position } = usePlayer();

  // Update game engine state when React state changes
  useEffect(() => {
    gameEngine.updateGameState({
      isSlowMotion,
      player,
      currentLocation,
      enemies,
      detectZoneChange
    });
  }, [isSlowMotion, player, currentLocation, enemies, detectZoneChange]);

  // Initialize game engine when canvas is ready
  useEffect(() => {
    if (canvasRef.current) {
      gameEngine.init(canvasRef.current);
    }

    return () => {
      gameEngine.stop();
    };
  }, []);

  // Handle joystick events
  useEffect(() => {
    const handleJoystickMove = (event: CustomEvent) => {
      const { deltaX, deltaY } = event.detail;
      gameEngine.handleJoystickMove(deltaX, deltaY);
    };

    const handleJoystickStop = () => {
      gameEngine.handleJoystickStop();
    };

    window.addEventListener('joystickMove', handleJoystickMove as EventListener);
    window.addEventListener('joystickStop', handleJoystickStop);

    return () => {
      window.removeEventListener('joystickMove', handleJoystickMove as EventListener);
      window.removeEventListener('joystickStop', handleJoystickStop);
    };
  }, []);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full touch-none"
        style={{ touchAction: 'none' }}
      />
      <EnemyRenderer 
        currentZone={currentLocation || 'LOC_HUB_FIGUREIUM'} 
        playerPosition={gameEngine.getPlayerPosition()} 
      />
    </div>
  );
};

export default GameCanvas;
