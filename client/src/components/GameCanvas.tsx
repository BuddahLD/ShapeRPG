import React, { useRef, useEffect, useCallback } from "react";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
// GameEngine removed - using clean architecture instead
import { DesignSystem } from "../lib/services/DesignSystem";
import { VisualEffects } from "../lib/services/VisualEffects";
import { MobRenderer } from "./MobRenderer";
import { ZoneConfigurationService } from "../domain/services/ZoneConfigurationService";
// WorldAreaManager removed - using clean architecture game state instead

interface GameCanvasProps {
  // No props needed - using clean architecture hooks
}

// GAME ENGINE - Completely separate from React rendering cycle
class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private _isRunning = false;
  
  // Game state refs - updated from React but used independently
  private gameState = {
    isSlowMotion: false,
    player: null as any,
    currentLocation: 'LOC_HUB_FIGUREIUM',
    mobs: [] as any[]
  };
  
  // Local game state
  private localPlayerPosition = { x: 0, y: 0 };
  private movementVelocity = { x: 0, y: 0 };
  private isMoving = false;
  private movePlayerFunction: ((deltaX: number, deltaY: number) => Promise<void>) | null = null;
  
  // Viewport scaling state
  private displayWidth = 0;
  private displayHeight = 0;
  private devicePixelRatio = 1;
  
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
    // Prevent multiple initializations
    if (this._isRunning) {
      console.log('GameEngine: Already running, skipping initialization');
      return;
    }
    
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    
    // Set up proper viewport scaling
    this.resizeCanvas(canvas);
    
    this._isRunning = true;
    this.startGameLoop();
    console.log('GameEngine: Initialized successfully');
  }

  // Update game state from React (called when React state changes)
  updateGameState(newState: any) {
    this.gameState = { ...this.gameState, ...newState };
  }

  // Start the game loop
  private startGameLoop() {
    if (!this._isRunning) return;
    this.gameLoop();
  }

  // Main game loop - completely independent of React
  private gameLoop = () => {
    const startTime = performance.now();
    
    try {
      if (!this.canvas || !this.ctx || !this._isRunning) {
        return;
      }

      // Ensure game state is properly initialized
      if (!this.gameState.mobs) {
        this.gameState.mobs = [];
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
        
        // Update the actual game state through the movePlayer function
        if (this.movePlayerFunction) {
          this.movePlayerFunction(this.movementVelocity.x, this.movementVelocity.y);
        }
        
        // Dispatch position update for minimap and other systems
        this.dispatchPositionUpdate();
      }

      // Update dummy movement (up-down movement for training dummies)
      this.updateDummyMovement(deltaTime);

      // Clear canvas using display dimensions
      this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);

      // Render game elements
      this.renderBackground();
      this.renderNPCs();
      this.renderPlayer();
      this.renderMobs();
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
    if (this._isRunning) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  };

  // Render methods - Restored from original with proper game engine architecture
  private renderBackground() {
    if (!this.ctx || !this.canvas) return;
    
    // Use display dimensions for coordinate calculations
    const centerX = this.displayWidth / 2;
    const centerY = this.displayHeight / 2;
    
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
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    
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
      if (right > 0 && left < this.displayWidth && bottom > 0 && top < this.displayHeight) {
        // Clamp to screen bounds
        const renderLeft = Math.max(0, left);
        const renderRight = Math.min(this.displayWidth, right);
        const renderTop = Math.max(0, top);
        const renderBottom = Math.min(this.displayHeight, bottom);
        
        // Render zone background with low opacity for subtle effect
        this.ctx!.fillStyle = `${zone.color}20`; // 12.5% opacity
        this.ctx!.fillRect(renderLeft, renderTop, renderRight - renderLeft, renderBottom - renderTop);
      }
    });

    // Add subtle grid pattern with modern styling
    this.ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
    this.ctx.lineWidth = 0.5;
    
    const gridSize = 50;
    const offsetX = (-this.localPlayerPosition.x % gridSize) + gridSize;
    const offsetY = (-this.localPlayerPosition.y % gridSize) + gridSize;
    
    // Vertical lines
    for (let x = offsetX; x < this.displayWidth; x += gridSize) {
      this.ctx!.beginPath();
      this.ctx!.moveTo(x, 0);
      this.ctx!.lineTo(x, this.displayHeight);
      this.ctx!.stroke();
    }
    
    // Horizontal lines
    for (let y = offsetY; y < this.displayHeight; y += gridSize) {
      this.ctx!.beginPath();
      this.ctx!.moveTo(0, y);
      this.ctx!.lineTo(this.displayWidth, y);
      this.ctx!.stroke();
    }
  }

  private renderPlayer() {
    if (!this.ctx || !this.canvas) return;
    
    // Use display dimensions for coordinate calculations
    const centerX = this.displayWidth / 2;
    const centerY = this.displayHeight / 2;

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
    
    // Use display dimensions for coordinate calculations
    const centerX = this.displayWidth / 2;
    const centerY = this.displayHeight / 2;

              // Define NPCs with their world coordinates - positioned at the top of hub with proper padding
              const hubTopPadding = 20; // Adequate padding from hub boundary to be fully inside
              const npcs = [
                {
                  id: "weapon_shop",
                  x: -20,
                  y: -150 + hubTopPadding + 6 + 16,
                  color: '#8b5cf6',
                  icon: "sword",
                  label: "WEAPONS",
                  gradient: ['#8b5cf6', '#a855f7', '#c084fc']
                },
                {
                  id: "armor_shop",
                  x: 40,
                  y: -150 + hubTopPadding + 6 + 16,
                  color: '#10b981',
                  icon: "shield",
                  label: "ARMOR",
                  gradient: ['#10b981', '#34d399', '#6ee7b7']
                },
                {
                  id: "trainer",
                  x: 100,
                  y: -150 + hubTopPadding + 6 + 16,
                  color: '#f59e0b',
                  icon: "book",
                  label: "TRAINER",
                  gradient: ['#f59e0b', '#fbbf24', '#fcd34d']
                },
              ];

    npcs.forEach(npc => {
      const screenX = centerX + (npc.x - this.localPlayerPosition.x);
      const screenY = centerY + (npc.y - this.localPlayerPosition.y);

      // Only render if on screen
      if (screenX > -50 && screenX < this.displayWidth + 50 && 
          screenY > -50 && screenY < this.displayHeight + 50) {
        
        this.renderBeautifulNPC(screenX, screenY, npc);
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

  private renderBeautifulNPC(screenX: number, screenY: number, npc: any) {
    if (!this.ctx) return;

    const size = 32; // Increased size for better visibility
    const glowSize = size + 16;
    
    this.ctx.save();

    // 1. Outer glow effect
    const glowGradient = this.ctx.createRadialGradient(
      screenX, screenY, 0,
      screenX, screenY, glowSize / 2
    );
    glowGradient.addColorStop(0, `${npc.color}40`);
    glowGradient.addColorStop(0.7, `${npc.color}20`);
    glowGradient.addColorStop(1, `${npc.color}00`);
    
    this.ctx.fillStyle = glowGradient;
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, glowSize / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Main circle with gradient
    const mainGradient = this.ctx.createRadialGradient(
      screenX - size * 0.2, screenY - size * 0.2, 0,
      screenX, screenY, size / 2
    );
    mainGradient.addColorStop(0, npc.gradient[2]); // Light
    mainGradient.addColorStop(0.6, npc.gradient[1]); // Medium
    mainGradient.addColorStop(1, npc.gradient[0]); // Dark

    this.ctx.fillStyle = mainGradient;
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 3. Inner highlight circle
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(screenX - size * 0.15, screenY - size * 0.15, size * 0.25, 0, Math.PI * 2);
    this.ctx.fill();

    // 4. Border with subtle shadow
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
    this.ctx.stroke();

    // 5. Modern icon rendering
    this.renderModernIcon(screenX, screenY, npc.icon, size);

    // 6. Arc text that hugs the top of NPC circle
    this.renderArcText(screenX, screenY, npc.label, size, npc.x);

    this.ctx.restore();
  }

  private renderModernIcon(x: number, y: number, iconType: string, size: number) {
    if (!this.ctx) return;

    const iconSize = size * 0.4; // Icon size relative to circle
    const strokeWidth = 2;
    
    this.ctx.save();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.lineWidth = strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    switch (iconType) {
      case 'sword':
        // Modern sword icon
        this.ctx.beginPath();
        // Blade
        this.ctx.moveTo(x, y - iconSize * 0.8);
        this.ctx.lineTo(x, y + iconSize * 0.3);
        // Crossguard
        this.ctx.moveTo(x - iconSize * 0.3, y + iconSize * 0.1);
        this.ctx.lineTo(x + iconSize * 0.3, y + iconSize * 0.1);
        // Handle
        this.ctx.moveTo(x, y + iconSize * 0.3);
        this.ctx.lineTo(x, y + iconSize * 0.6);
        // Pommel
        this.ctx.arc(x, y + iconSize * 0.6, iconSize * 0.1, 0, Math.PI * 2);
        this.ctx.stroke();
        break;

      case 'shield':
        // Modern shield icon
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - iconSize * 0.7);
        this.ctx.quadraticCurveTo(x + iconSize * 0.4, y - iconSize * 0.3, x + iconSize * 0.3, y + iconSize * 0.2);
        this.ctx.quadraticCurveTo(x + iconSize * 0.2, y + iconSize * 0.6, x, y + iconSize * 0.7);
        this.ctx.quadraticCurveTo(x - iconSize * 0.2, y + iconSize * 0.6, x - iconSize * 0.3, y + iconSize * 0.2);
        this.ctx.quadraticCurveTo(x - iconSize * 0.4, y - iconSize * 0.3, x, y - iconSize * 0.7);
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Shield cross
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - iconSize * 0.2);
        this.ctx.lineTo(x, y + iconSize * 0.2);
        this.ctx.moveTo(x - iconSize * 0.15, y);
        this.ctx.lineTo(x + iconSize * 0.15, y);
        this.ctx.stroke();
        break;

      case 'book':
        // Modern book icon
        this.ctx.beginPath();
        // Book cover
        this.ctx.rect(x - iconSize * 0.4, y - iconSize * 0.5, iconSize * 0.8, iconSize);
        this.ctx.stroke();
        
        // Book pages
        this.ctx.beginPath();
        this.ctx.moveTo(x - iconSize * 0.3, y - iconSize * 0.4);
        this.ctx.lineTo(x + iconSize * 0.3, y - iconSize * 0.4);
        this.ctx.moveTo(x - iconSize * 0.3, y - iconSize * 0.2);
        this.ctx.lineTo(x + iconSize * 0.3, y - iconSize * 0.2);
        this.ctx.moveTo(x - iconSize * 0.3, y);
        this.ctx.lineTo(x + iconSize * 0.3, y);
        this.ctx.moveTo(x - iconSize * 0.3, y + iconSize * 0.2);
        this.ctx.lineTo(x + iconSize * 0.3, y + iconSize * 0.2);
        this.ctx.stroke();
        
        // Book spine
        this.ctx.beginPath();
        this.ctx.moveTo(x - iconSize * 0.4, y - iconSize * 0.5);
        this.ctx.lineTo(x - iconSize * 0.4, y + iconSize * 0.5);
        this.ctx.stroke();
        break;
    }

    this.ctx.restore();
  }

  private renderArcText(centerX: number, centerY: number, text: string, circleSize: number, npcX: number) {
    if (!this.ctx) return;

    this.ctx.save();
    
    // Calculate arc parameters - letters standing on the circle
    const radius = circleSize / 2 + 2; // Letters sit 2px above the circle edge
    const letterSpacing = 0.35; // Fixed letter spacing in radians (about 20 degrees)
    const textLength = text.length;
    
    // Calculate total arc span and center it
    const totalArcSpan = letterSpacing * (textLength - 1);
    const startAngle = -Math.PI/2 - (totalArcSpan / 2); // Start from top-left
    const endAngle = -Math.PI/2 + (totalArcSpan / 2); // End at top-right
    
    // Set text properties with modern font (8px size with proper letter spacing)
    this.ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom'; // Align to bottom so letters "stand" on circle
    
    // Render each character along the arc with fixed spacing
    for (let i = 0; i < textLength; i++) {
      const angle = startAngle + (letterSpacing * i);
      const charX = centerX + Math.cos(angle) * radius;
      const charY = centerY + Math.sin(angle) * radius;
      
      // Rotate each character to be perpendicular to the circle
      this.ctx.save();
      this.ctx.translate(charX, charY);
      this.ctx.rotate(angle + Math.PI/2); // Rotate to be perpendicular to radius
      
      // Character shadow for depth
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillText(text[i], 1, 1);
      
      // Main character with gradient
      const charGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
      charGradient.addColorStop(0, '#ffffff');
      charGradient.addColorStop(0.7, '#f8fafc');
      charGradient.addColorStop(1, '#e2e8f0');
      
      this.ctx.fillStyle = charGradient;
      this.ctx.fillText(text[i], 0, 0);
      
      this.ctx.restore();
    }
    
    this.ctx.restore();
  }

  private renderMobs() {
    if (!this.ctx || !this.canvas || !this.gameState.mobs) return;
    
    // Use display dimensions for coordinate calculations
    const centerX = this.displayWidth / 2;
    const centerY = this.displayHeight / 2;

    this.gameState.mobs.forEach((mob: any) => {
      const screenX = centerX + (mob.position.x - this.localPlayerPosition.x);
      const screenY = centerY + (mob.position.y - this.localPlayerPosition.y);

      // Only render if on screen
      if (screenX > -50 && screenX < this.displayWidth + 50 && 
          screenY > -50 && screenY < this.displayHeight + 50) {
        
        const size = mob.size || 20;
        this.renderMob(screenX, screenY, mob.type, size);
      }
    });
  }

  private renderMob(x: number, y: number, type: string, size: number) {
    if (!this.ctx) return;
    
    // Add floating animation
    const floatOffset = Math.sin(Date.now() * 0.003 + x * 0.01) * 2;
    
    if (type === 'HEX_PEACEFUL') {
      // Hexagonal mob
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
      // Triangular mob
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
    
    // Use display dimensions for coordinate calculations
    const centerX = this.displayWidth / 2;
    const centerY = this.displayHeight / 2;
    
    // Get zone data from single source of truth
    const zoneColors = ZoneConfigurationService.getZoneColors();
    const zoneBounds = ZoneConfigurationService.getZoneBounds();
    
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
      if (right > 0 && left < this.displayWidth && bottom > 0 && top < this.displayHeight) {
        // Zone boundary box
        this.ctx!.strokeStyle = `${color}80`; // 50% opacity
        this.ctx!.lineWidth = 2;
        this.ctx!.setLineDash([4, 8]);
        
        this.ctx!.beginPath();
        this.ctx!.rect(left, top, right - left, bottom - top);
        this.ctx!.stroke();
        
        // Zone corner markers
        this.ctx!.fillStyle = color;
        this.ctx!.setLineDash([]);
        
        // Corner squares (8x8 pixels)
        const cornerSize = 8;
        this.ctx!.fillRect(left - cornerSize/2, top - cornerSize/2, cornerSize, cornerSize);
        this.ctx!.fillRect(right - cornerSize/2, top - cornerSize/2, cornerSize, cornerSize);
        this.ctx!.fillRect(left - cornerSize/2, bottom - cornerSize/2, cornerSize, cornerSize);
        this.ctx!.fillRect(right - cornerSize/2, bottom - cornerSize/2, cornerSize, cornerSize);
      }
    });
    
    // Zone transition lines (enhanced)
    this.ctx!.strokeStyle = `rgba(255, 255, 255, 0.4)`;
    this.ctx!.lineWidth = 2;
    this.ctx!.setLineDash([12, 8]);
    
    // Hub → Fields transition at x=200
    const hubFieldsLine = centerX + (200 - this.localPlayerPosition.x);
    if (hubFieldsLine > -50 && hubFieldsLine < this.displayWidth + 50) {
      this.ctx!.beginPath();
      this.ctx!.moveTo(hubFieldsLine, 0);
      this.ctx!.lineTo(hubFieldsLine, this.displayHeight);
      this.ctx!.stroke();
    }
    
    // Fields → Shards transition at x=600
    const fieldsShardsLine = centerX + (600 - this.localPlayerPosition.x);
    if (fieldsShardsLine > -50 && fieldsShardsLine < this.displayWidth + 50) {
      this.ctx!.beginPath();
      this.ctx!.moveTo(fieldsShardsLine, 0);
      this.ctx!.lineTo(fieldsShardsLine, this.displayHeight);
      this.ctx!.stroke();
    }
    
    this.ctx!.setLineDash([]);
  }

  // Set the movePlayer function from React
  setMovePlayerFunction(movePlayer: (deltaX: number, deltaY: number) => Promise<void>) {
    this.movePlayerFunction = movePlayer;
  }

  // Resize canvas with proper viewport scaling (based on game engine best practices)
  resizeCanvas(canvas: HTMLCanvasElement) {
    if (!canvas) return;

    // Get device pixel ratio for high-DPI displays
    this.devicePixelRatio = window.devicePixelRatio || 1;
    
    // Get display size
    this.displayWidth = window.innerWidth;
    this.displayHeight = window.innerHeight;
    
    // Set canvas display size (CSS pixels)
    canvas.style.width = `${this.displayWidth}px`;
    canvas.style.height = `${this.displayHeight}px`;
    
    // Set canvas internal resolution (actual pixels)
    // This ensures crisp rendering on high-DPI displays
    canvas.width = this.displayWidth * this.devicePixelRatio;
    canvas.height = this.displayHeight * this.devicePixelRatio;
    
    // Scale the drawing context to match device pixel ratio
    if (this.ctx) {
      this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }
    
    console.log('GameEngine: Canvas resized', {
      displaySize: { width: this.displayWidth, height: this.displayHeight },
      internalSize: { width: canvas.width, height: canvas.height },
      devicePixelRatio: this.devicePixelRatio
    });
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

  // Get current player position
  getPlayerPosition() {
    return { ...this.localPlayerPosition };
  }

  // Stop the game engine
  stop() {
    this._isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Get performance stats
  getStats() {
    return { ...this.stats };
  }

  // Check if game engine is running
  get isRunning() {
    return this._isRunning;
  }


  // Dispatch position update for minimap and other systems
  private updateDummyMovement(deltaTime: number) {
    // Update dummy movement through the mob manager
    // This will be handled by the MobRenderer component which has access to MobManager
    // We dispatch an event to trigger the update
    try {
      // Debug: Log dummy movement updates (reduced frequency)
      if (Math.random() < 0.001) { // Log 0.1% of updates to avoid spam
        console.log('GameEngine: Dispatching dummy movement update, deltaTime:', deltaTime);
      }
      
      window.dispatchEvent(new CustomEvent('updateDummyMovement', {
        detail: { deltaTime }
      }));
    } catch (error) {
      console.warn('GameEngine: Dummy movement update dispatch failed', error);
    }
  }

  private dispatchPositionUpdate() {
    try {
      window.dispatchEvent(new CustomEvent('playerPositionUpdate', {
        detail: { position: { ...this.localPlayerPosition } }
      }));
    } catch (error) {
      console.warn('GameEngine: Position update dispatch failed', error);
    }
  }
}

// Global game engine instance - singleton pattern
let gameEngine: GameEngine | null = null;

const getGameEngine = () => {
  if (!gameEngine) {
    console.log('GameEngine: Creating new game engine instance');
    gameEngine = new GameEngine();
  }
  return gameEngine;
};

const GameCanvas: React.FC<GameCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentLocation, enemies, isSlowMotion, gameState, detectZoneChange } = useGameState();
  const { player, position, movePlayer } = usePlayer();

  // Debug: Log when GameCanvas re-renders (only when drawing rune)
  if (gameState.isDrawingRune) {
    console.log('GameCanvas: Re-rendering for rune drawing', { 
      isDrawingRune: gameState.isDrawingRune,
      gamePhase: gameState.gamePhase
    });
  }

  // Update game engine state when React state changes
  useEffect(() => {
    getGameEngine().updateGameState({
      isSlowMotion,
      player,
      currentLocation,
      mobs: enemies
    });
  }, [isSlowMotion, player, currentLocation, enemies]);

  // Set the movePlayer function in the game engine
  useEffect(() => {
    if (movePlayer) {
      getGameEngine().setMovePlayerFunction(movePlayer);
    }
  }, [movePlayer]);

  // Initialize game engine when canvas is ready - only once
  useEffect(() => {
    if (canvasRef.current) {
      console.log('GameCanvas: Initializing game engine');
      getGameEngine().init(canvasRef.current);
    }

    return () => {
      console.log('GameCanvas: Cleaning up game engine');
      getGameEngine().stop();
    };
  }, []); // Empty dependency array - only run once

  // Handle joystick events
  useEffect(() => {
    const handleJoystickMove = (event: CustomEvent) => {
      const { deltaX, deltaY } = event.detail;
      getGameEngine().handleJoystickMove(deltaX, deltaY);
    };

    const handleJoystickStop = () => {
      getGameEngine().handleJoystickStop();
    };

    window.addEventListener('joystickMove', handleJoystickMove as EventListener);
    window.addEventListener('joystickStop', handleJoystickStop);

    return () => {
      window.removeEventListener('joystickMove', handleJoystickMove as EventListener);
      window.removeEventListener('joystickStop', handleJoystickStop);
    };
  }, []);

  // Handle position updates for zone detection (separate from game engine)
  useEffect(() => {
    const handlePositionUpdate = async (event: CustomEvent) => {
      const { position } = event.detail;
      if (position && detectZoneChange) {
        try {
          const zoneChanged = await detectZoneChange(position);
          if (zoneChanged) {
            console.log('Zone changed to new position:', position);
          }
        } catch (error) {
          console.warn('Zone detection failed:', error);
        }
      }
    };

    window.addEventListener('playerPositionUpdate', handlePositionUpdate as unknown as EventListener);
    return () => {
      window.removeEventListener('playerPositionUpdate', handlePositionUpdate as unknown as EventListener);
    };
  }, [detectZoneChange]);

  // Handle canvas resize with proper viewport scaling
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        getGameEngine().resizeCanvas(canvasRef.current);
      }
    };

    // Initial resize
    if (canvasRef.current) {
      getGameEngine().resizeCanvas(canvasRef.current);
    }

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
      <MobRenderer 
        currentZone={currentLocation || 'LOC_HUB_FIGUREIUM'} 
        playerPosition={getGameEngine().getPlayerPosition()} 
      />
    </div>
  );
};

export default GameCanvas;
