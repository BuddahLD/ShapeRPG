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
    const centerX = width - 60; // 60px from right edge
    const centerY = 60; // 60px from top edge
    const radius = 30; // Fixed radius for the rune button

    // Draw outer circle (background)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw progress circle (burning down counter-clockwise)
    const startAngle = Math.PI / 2; // Start from top
    const endAngle = startAngle - (2 * Math.PI * progress);
    
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.stroke();
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

      // Add new particles occasionally
      if (Math.random() < 0.3) {
        const canvas = canvasRef.current;
        if (canvas) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
          
          const angle = Math.random() * 2 * Math.PI;
          const particleX = centerX + Math.cos(angle) * radius;
          const particleY = centerY + Math.sin(angle) * radius;
          
          newParticles.push({
            id: currentTime,
            x: particleX,
            y: particleY,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1,
            size: 1 + Math.random() * 2,
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

    // Convert to normalized direction vector
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dirX = (x - centerX) / centerX;
    const dirY = (y - centerY) / centerY;

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

    // Convert to normalized direction vector
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dirX = (x - centerX) / centerX;
    const dirY = (y - centerY) / centerY;

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
            left: `calc(50% + ${direction.x * 100}px)`,
            top: `calc(50% + ${direction.y * 100}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
};

export default CastAnimation;
