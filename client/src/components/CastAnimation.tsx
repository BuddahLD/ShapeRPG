import React, { useEffect, useRef, useState } from 'react';

interface CastAnimationProps {
  isActive: boolean;
  castTime: number; // in seconds
  onComplete: () => void;
  onDirectionSet: (direction: { x: number; y: number }) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

const CastAnimation: React.FC<CastAnimationProps> = ({ 
  isActive, 
  castTime, 
  onComplete, 
  onDirectionSet 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [direction, setDirection] = useState<{ x: number; y: number } | null>(null);

  // Set up canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      const now = performance.now();
      startTimeRef.current = now;
      setDirection(null);
      setParticles([]);
      startAnimation();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setParticles([]);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, castTime]);

  const startAnimation = () => {
    const animate = (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const elapsed = (currentTime - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / castTime, 1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw cast circle
      drawCastCircle(ctx, canvas.width, canvas.height, progress);

      // Update and draw particles
      updateParticles(currentTime);
      drawParticles(ctx);

      // Check if cast is complete
      if (progress >= 1) {
        onComplete();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawCastCircle = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    // Position the circle at the rune button location (top-right area)
    // ActionBar is positioned at top: 140px, right: 2rem (32px), button size: 40px
    const centerX = width - 32 - 20; // 32px (2rem) + 20px (half button width)
    const centerY = 140 + 20; // 140px + 20px (half button height)
    const outerRadius = 20; // Button radius (40px / 2)
    const innerRadius = 16; // Inner circle radius (slightly smaller for the border effect)
    
    // The animation should be a thin ring between inner and outer radius
    const animationRadius = (outerRadius + innerRadius) / 2; // Middle of the two circles
    const ringWidth = 2; // Thin ring

    // Draw the inner border animation (thin cyan ring)
    const startAngle = Math.PI / 2; // Start from top
    const endAngle = startAngle - (2 * Math.PI * progress);

    // Set up the ring drawing
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = ringWidth;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    
    // Draw the progress ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, animationRadius, startAngle, endAngle);
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const updateParticles = (currentTime: number) => {
    setParticles(prevParticles => {
      const newParticles = prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.016, // ~60fps
          vx: particle.vx * 0.98, // Friction
          vy: particle.vy * 0.98,
        }))
        .filter(particle => particle.life > 0);

      // Add new particles occasionally around the rune button
      if (Math.random() < 0.3) {
        const canvas = canvasRef.current;
        if (canvas) {
          // Position particles around the rune button
          const centerX = canvas.width - 32 - 20; // Same as rune button center
          const centerY = 140 + 20;
          const radius = 25; // Slightly larger than button for particle spread

          const angle = Math.random() * 2 * Math.PI;
          const particleX = centerX + Math.cos(angle) * radius;
          const particleY = centerY + Math.sin(angle) * radius;

          newParticles.push({
            id: currentTime,
            x: particleX,
            y: particleY,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1,
            size: 1 + Math.random() * 1.5,
          });
        }
      }

      return newParticles;
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || direction) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to normalized direction vector relative to rune button
    const centerX = canvas.width - 32 - 20; // Rune button center X
    const centerY = 140 + 20; // Rune button center Y
    const dirX = (x - centerX) / 20; // Normalize by button radius
    const dirY = (y - centerY) / 20;

    setDirection({ x: dirX, y: dirY });
    onDirectionSet({ x: dirX, y: dirY });
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isActive || direction) return;

    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Convert to normalized direction vector relative to rune button
    const centerX = canvas.width - 32 - 20; // Rune button center X
    const centerY = 140 + 20; // Rune button center Y
    const dirX = (x - centerX) / 20; // Normalize by button radius
    const dirY = (y - centerY) / 20;

    setDirection({ x: dirX, y: dirY });
    onDirectionSet({ x: dirX, y: dirY });
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
        onMouseDown={handleCanvasClick}
        onTouchStart={handleCanvasTouch}
      />
      
      {/* Direction indicator */}
      {direction && (
        <div 
          className="absolute w-4 h-4 bg-cyan-400 rounded-full border-2 border-white shadow-lg"
          style={{
            left: `${window.innerWidth - 32 - 20 + direction.x * 20}px`,
            top: `${140 + 20 + direction.y * 20}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
};

export default CastAnimation;
