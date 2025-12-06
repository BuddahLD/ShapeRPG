import React, { useEffect, useRef, useCallback } from 'react';

interface SparkleParticlesProps {
    progress: number; // 0 to 100
    size?: number; // Size of the container in px
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

export const SparkleParticles: React.FC<SparkleParticlesProps> = ({ progress, size = 40 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const progressRef = useRef(progress);
    const lastProgressRef = useRef(progress);

    // Constants
    const CENTER = size / 2;
    const RADIUS = 18;
    const CAP_OFFSET_RAD = 0.05;

    // Keep progress ref in sync
    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    // Main Render/Simulation Loop
    const renderLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, size, size);

        const currentProgress = progressRef.current;

        // Spawn Logic
        if (currentProgress > lastProgressRef.current && currentProgress < 100) {
            const diff = currentProgress - lastProgressRef.current;
            const steps = Math.min(Math.ceil(diff * 3), 10);

            for (let s = 1; s <= steps; s++) {
                const stepP = lastProgressRef.current + (diff * (s / steps));

                // Math: Counter-Clockwise
                const angle = -Math.PI / 2 - (2 * Math.PI * (stepP / 100)) - CAP_OFFSET_RAD;

                const tipX = CENTER + RADIUS * Math.cos(angle);
                const tipY = CENTER + RADIUS * Math.sin(angle);

                particlesRef.current.push({
                    x: tipX + (Math.random() - 0.5) * 2,
                    y: tipY + (Math.random() - 0.5) * 2,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    life: 1.0,
                    maxLife: 0.2 + Math.random() * 0.3,
                    color: Math.random() > 0.6 ? '#00ffff' : '#ffffff',
                    size: 0.5 + Math.random() * 1.5
                });
            }
        }

        lastProgressRef.current = currentProgress;

        // Update & Draw Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.08;

            if (p.life > 0) {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                particlesRef.current.splice(i, 1);
            }
        }

        ctx.globalAlpha = 1.0;

        // Continue loop logic:
        // If we have particles OR we expect the animation is active (progress slightly > 0 and < 100)
        // We check > 0.1 to avoid infinite loop at exact 0 if there's floating point noise, though unlikely with integers
        const hasActiveParticles = particlesRef.current.length > 0;
        const isAnimating = currentProgress > 0 && currentProgress < 100;

        if (hasActiveParticles || isAnimating) {
            animationFrameRef.current = requestAnimationFrame(renderLoop);
        } else {
            animationFrameRef.current = null; // Mark as stopped
        }
    }, [size]); // Dependencies for the loop function itself (constants)

    // Wake up loop when progress changes
    useEffect(() => {
        if (!animationFrameRef.current && progress > 0 && progress < 100) {
            // Start if stopped and should be running
            animationFrameRef.current = requestAnimationFrame(renderLoop);
        }
    }, [progress, renderLoop]);

    // Handle Canvas Resize
    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = size;
            canvasRef.current.height = size;
        }
    }, [size]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width: size, height: size }}
        />
    );
};
