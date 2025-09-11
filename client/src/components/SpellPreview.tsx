import React, { useRef, useEffect } from 'react';

interface SpellPreviewProps {
  pattern: string;
  size?: number;
  className?: string;
}

const SpellPreview: React.FC<SpellPreviewProps> = ({ 
  pattern, 
  size = 60, 
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Set drawing properties
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;

    // Draw the pattern based on type
    drawPattern(ctx, pattern, size);

  }, [pattern, size]);

  const drawPattern = (ctx: CanvasRenderingContext2D, pattern: string, size: number) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35; // 35% of canvas size

    switch (pattern) {
      case 'triangle':
        drawTriangle(ctx, centerX, centerY, radius);
        break;
      case 'zigzag':
        drawZigzag(ctx, centerX, centerY, radius);
        break;
      case 'circle':
        drawCircle(ctx, centerX, centerY, radius);
        break;
      case 'wave':
        drawWave(ctx, centerX, centerY, radius);
        break;
      default:
        drawUnknown(ctx, centerX, centerY, radius);
    }
  };

  const drawTriangle = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.beginPath();
    
    // Calculate triangle vertices (pointing up)
    const topX = centerX;
    const topY = centerY - radius;
    const leftX = centerX - radius * 0.866; // cos(30°) * radius
    const leftY = centerY + radius * 0.5;   // sin(30°) * radius
    const rightX = centerX + radius * 0.866;
    const rightY = centerY + radius * 0.5;

    // Draw triangle
    ctx.moveTo(topX, topY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.stroke();
  };

  const drawZigzag = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.beginPath();
    
    const segments = 6;
    const segmentWidth = (radius * 2) / segments;
    const amplitude = radius * 0.4;
    
    ctx.moveTo(centerX - radius, centerY);
    
    for (let i = 0; i <= segments; i++) {
      const x = centerX - radius + (i * segmentWidth);
      const y = centerY + (i % 2 === 0 ? -amplitude : amplitude);
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawWave = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.beginPath();
    
    const points = 20;
    const width = radius * 2;
    const amplitude = radius * 0.3;
    
    ctx.moveTo(centerX - radius, centerY);
    
    for (let i = 0; i <= points; i++) {
      const x = centerX - radius + (i * width / points);
      const y = centerY + Math.sin((i * Math.PI * 3) / points) * amplitude;
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
  };

  const drawUnknown = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    // Draw a question mark for unknown patterns
    ctx.font = `${radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('?', centerX, centerY);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      style={{ 
        width: size, 
        height: size,
        imageRendering: 'pixelated'
      }}
    />
  );
};

export default SpellPreview;
