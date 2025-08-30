// Visual Effects Service - Cartoon-style rendering with contours
// Inspired by Prince of Persia 2008 aesthetic

import { DesignSystem } from './DesignSystem';

export class VisualEffects {
  // Apply cartoon-style outline to shapes
  static drawShapeWithContour(
    ctx: CanvasRenderingContext2D,
    drawFn: () => void,
    fillColor: string,
    strokeColor: string = '#2d3748',
    strokeWidth: number = 2
  ) {
    // Save context
    ctx.save();
    
    // Draw outline (slightly larger)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth + 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    drawFn();
    ctx.stroke();
    
    // Draw main shape
    ctx.fillStyle = fillColor;
    ctx.lineWidth = strokeWidth;
    drawFn();
    ctx.fill();
    ctx.stroke();
    
    // Restore context
    ctx.restore();
  }

  // Draw player with modern design
  static drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, size: number = 30) {
    const drawSquare = () => {
      ctx.beginPath();
      ctx.roundRect(x - size/2, y - size/2, size, size, 6);
    };

    this.drawShapeWithContour(
      ctx,
      drawSquare,
      DesignSystem.COLORS.primary[400], // Modern blue
      DesignSystem.COLORS.primary[800], // Darker blue outline
      3
    );

    // Add highlight for 3D effect
    ctx.save();
    ctx.fillStyle = DesignSystem.COLORS.primary[200];
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x - size/2 + 2, y - size/2 + 2, size - 10, 8);
    ctx.restore();
  }

  // Draw enemy with zone-appropriate styling
  static drawEnemy(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    type: 'HEX_PEACEFUL' | 'TRI_ARENA',
    size: number = 20,
    zoneId: string
  ) {
    const zoneColors = DesignSystem.getZoneColors(zoneId);
    
    if (type === 'HEX_PEACEFUL') {
      const drawHexagon = () => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const px = x + Math.cos(angle) * size;
          const py = y + Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      };

      this.drawShapeWithContour(
        ctx,
        drawHexagon,
        DesignSystem.COLORS.secondary[400], // Coral fill
        DesignSystem.COLORS.secondary[700], // Darker coral outline
        2
      );
    } else {
      const drawTriangle = () => {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
      };

      this.drawShapeWithContour(
        ctx,
        drawTriangle,
        DesignSystem.COLORS.error, // Red fill
        DesignSystem.COLORS.neutral[800], // Dark outline
        2
      );
    }
  }

  // Draw NPC with modern styling
  static drawNPC(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number, 
    color: string,
    icon: string,
    radius: number = 20
  ) {
    const drawCircle = () => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    };

    this.drawShapeWithContour(
      ctx,
      drawCircle,
      color,
      DesignSystem.COLORS.neutral[700],
      2
    );

    // Draw icon with modern typography
    ctx.save();
    ctx.fillStyle = DesignSystem.COLORS.neutral[50];
    ctx.font = `${radius}px ${DesignSystem.TYPOGRAPHY.fonts.text}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, x, y);
    ctx.restore();
  }

  // Draw health bar with modern design
  static drawHealthBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    healthPercentage: number
  ) {
    const radius = height / 2;
    
    // Background
    ctx.save();
    ctx.fillStyle = DesignSystem.COLORS.neutral[200];
    ctx.beginPath();
    ctx.roundRect(x - width/2, y, width, height, radius);
    ctx.fill();
    
    // Health fill
    const healthWidth = width * healthPercentage;
    ctx.fillStyle = healthPercentage > 0.6 ? DesignSystem.COLORS.success :
                     healthPercentage > 0.3 ? DesignSystem.COLORS.warning :
                     DesignSystem.COLORS.error;
    
    ctx.beginPath();
    ctx.roundRect(x - width/2, y, healthWidth, height, radius);
    ctx.fill();
    
    // Subtle border
    ctx.strokeStyle = DesignSystem.COLORS.neutral[300];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - width/2, y, width, height, radius);
    ctx.stroke();
    
    ctx.restore();
  }

  // Create floating animation effect
  static createFloatingAnimation(time: number, amplitude: number = 3): number {
    return Math.sin(time * 0.002) * amplitude;
  }

  // Apply glow effect for magical elements
  static applyMagicalGlow(ctx: CanvasRenderingContext2D, glowType: 'fire' | 'ice' | 'magic') {
    ctx.shadowColor = glowType === 'fire' ? '#ff6b6b' :
                      glowType === 'ice' ? '#93c5fd' :
                      '#c4b5fd';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}