/**
 * Infrastructure Service: Animation Management
 * Single Responsibility: Handle canvas-based animations
 * SOLID: Depends only on Application layer, provides concrete implementation
 */

import { AnimationService as IAnimationService, AnimationCallbacks } from '../../application/services/CastingService';

export class AnimationService implements IAnimationService {
  private canvas: HTMLCanvasElement | null = null;
  private animationId: number | null = null;
  private startTime: number = 0;
  private callbacks: AnimationCallbacks | null = null;

  /**
   * Start casting animation
   */
  async startCastingAnimation(
    spellId: string, 
    castTime: number, 
    callbacks: AnimationCallbacks
  ): Promise<void> {
    console.log('🎬 AnimationService: startCastingAnimation called with spellId:', spellId, 'castTime:', castTime);
    this.callbacks = callbacks;
    this.startTime = performance.now();
    
    // Create canvas if it doesn't exist
    if (!this.canvas) {
      console.log('🎬 AnimationService: Creating canvas');
      this.createCanvas();
    }

    if (!this.canvas) {
      throw new Error('Failed to create animation canvas');
    }

    console.log('🎬 AnimationService: Starting animation loop');
    // Start animation loop
    this.animate(castTime);
  }

  /**
   * Stop current animation
   */
  async stopCastingAnimation(): Promise<void> {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Create animation canvas
   */
  private createCanvas(): void {
    this.canvas = document.createElement('canvas');
    
    // Set canvas size to match viewport
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Set canvas styles
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '40';
    
    console.log('🎬 AnimationService: Canvas created with dimensions:', this.canvas.width, 'x', this.canvas.height);
    console.log('🎬 AnimationService: Window dimensions:', width, 'x', height);
    console.log('🎬 AnimationService: Canvas styles:', this.canvas.style.cssText);
    
    document.body.appendChild(this.canvas);
    console.log('🎬 AnimationService: Canvas added to document.body');
  }

  /**
   * Animation loop
   */
  private animate(castTime: number): void {
    const animate = (currentTime: number) => {
      if (!this.canvas) {
        console.log('🎬 AnimationService: No canvas, stopping animation');
        return;
      }

      const ctx = this.canvas.getContext('2d');
      if (!ctx) {
        console.log('🎬 AnimationService: No canvas context, stopping animation');
        return;
      }

      const elapsed = (currentTime - this.startTime) / 1000;
      const progress = Math.min(elapsed / castTime, 1);

      console.log('🎬 AnimationService: Animation frame - elapsed:', elapsed, 'progress:', progress);

      // Clear canvas
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw casting ring
      this.drawCastingRing(ctx, progress);

      // Check if complete
      if (progress >= 1) {
        console.log('🎬 AnimationService: Animation complete');
        this.callbacks?.onComplete();
        return;
      }

      this.animationId = requestAnimationFrame(animate);
    };

    console.log('🎬 AnimationService: Starting animation frame');
    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * Draw the casting ring on the rune button
   */
  private drawCastingRing(ctx: CanvasRenderingContext2D, progress: number): void {
    if (!this.canvas) return;

    // Position at rune button location (top-right)
    // ActionBar is positioned at top: 140px, right: 2rem (32px), button size: 40px
    const centerX = this.canvas.width - 32 - 20; // 32px (2rem) + 20px (half button width)
    const centerY = 140 + 20; // 140px + 20px (half button height)
    const outerRadius = 20; // Button radius (40px / 2)
    const innerRadius = 16; // Inner circle radius (slightly smaller for the border effect)
    const animationRadius = (outerRadius + innerRadius) / 2; // Middle of the two circles
    const ringWidth = 2; // Thin ring

    console.log('🎬 AnimationService: Drawing ring at centerX:', centerX, 'centerY:', centerY, 'progress:', progress);

    // Debug: Draw a small dot at the calculated center to verify positioning
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fill();

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
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopCastingAnimation();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.callbacks = null;
  }
}
