/**
 * Component: MobRenderer
 * Renders mobs on the game canvas
 */

import React, { useEffect, useState, useRef } from 'react';
import { Enemy } from '../domain/entities/Enemy';
import { MobManager } from '../application/services/MobManager';
import { AppBootstrapService } from '../application/AppBootstrapService';

interface MobRendererProps {
  currentZone: string;
  playerPosition: { x: number; y: number };
}

export const MobRenderer: React.FC<MobRendererProps> = ({ 
  currentZone, 
  playerPosition 
}) => {
  const [mobs, setMobs] = useState<Enemy[]>([]);
  const [mobManager] = useState(() => AppBootstrapService.getInstance().getMobManager());
  const lastSpawnCheck = useRef({ x: 0, y: 0, zone: '' });
  const spawnCheckDistance = 50; // Only check spawns when player moves 50 units
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initial spawn check and zone change detection
  useEffect(() => {
    console.log('MobRenderer: Spawn check triggered for zone:', currentZone, 'player pos:', playerPosition);
    console.log('MobRenderer: Player position type:', typeof playerPosition, 'keys:', Object.keys(playerPosition));
    
    // Only proceed if player position is valid
    if (playerPosition && typeof playerPosition.x === 'number' && typeof playerPosition.y === 'number') {
      console.log('MobRenderer: Calling updateMobSpawning with position:', playerPosition, 'zone:', currentZone);
      const spawnEvents = mobManager.updateEnemySpawning(playerPosition, currentZone);
      const allMobs = mobManager.getAllEnemies();
      console.log('MobRenderer: Spawn events:', spawnEvents.length, spawnEvents.map(e => e.type));
      console.log('MobRenderer: All mobs after spawn check:', allMobs.length, allMobs.map(e => ({ id: e.id, type: e.type, position: e.position })));
      setMobs(allMobs);
      lastSpawnCheck.current = { x: playerPosition.x, y: playerPosition.y, zone: currentZone };
    } else {
      console.warn('MobRenderer: Invalid player position:', playerPosition);
    }
  }, [currentZone, playerPosition.x, playerPosition.y, mobManager]); // Run when zone or position changes


  // Use refs to avoid dependencies that cause re-renders
  const mobManagerRef = useRef(mobManager);
  const playerPositionRef = useRef(playerPosition);
  const currentZoneRef = useRef(currentZone);
  
  // Update refs when values change (no re-render trigger)
  mobManagerRef.current = mobManager;
  playerPositionRef.current = playerPosition;
  currentZoneRef.current = currentZone;

  // Canvas-based rendering for mobs (like NPCs)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    console.log('MobRenderer: Rendering', mobs.length, 'mobs on canvas');
    console.log('MobRenderer: Player position:', playerPosition);

    // Render mobs on canvas
    mobs.forEach(mob => {
      if (!mob.isAlive()) return;

      const { x, y } = mob.position;
      const { size } = mob.stats;
      
      // Convert world coordinates to screen coordinates (same as NPCs)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const screenX = centerX + (x - playerPosition.x);
      const screenY = centerY + (y - playerPosition.y);

      console.log(`MobRenderer: Mob ${mob.id} at world(${x}, ${y}) -> screen(${screenX}, ${screenY})`);

      // Only render if on screen
      if (screenX > -50 && screenX < canvas.width + 50 && 
          screenY > -50 && screenY < canvas.height + 50) {
        
        // Draw mob
        renderMobOnCanvas(ctx, screenX, screenY, mob.type, size);
      }
    });
  }, [mobs, playerPosition]);

  // Render mob on canvas (same as NPCs)
  const renderMobOnCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string, size: number) => {
    // Determine mob color and shape based on type
    let color = '#666';
    let shape = 'triangle';
    
    switch (type) {
      case 'DUMMY':
        color = '#999';
        shape = 'circle';
        break;
      case 'HEX_PEACEFUL':
        color = '#4CAF50';
        shape = 'hexagon';
        break;
      case 'TRI_SMALL':
        color = '#FF9800';
        shape = 'triangle';
        break;
      case 'TRI_AGGRESSIVE':
        color = '#F44336';
        shape = 'triangle';
        break;
    }

    // Draw mob shape
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (shape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x - size / 2, y + size / 2);
      ctx.lineTo(x + size / 2, y + size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (shape === 'hexagon') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + (size / 2) * Math.cos(angle);
        const py = y + (size / 2) * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();
  };

  useEffect(() => {
    // Update mobs every 100ms (10fps) - much more reasonable
    const updateInterval = setInterval(() => {
      // Update existing mobs
        const updateResult = mobManagerRef.current.updateMobs(100, Date.now()); // 10fps
      
      // Check for new spawns every 1000ms (1 time per second) - much less frequent
      const now = Date.now();
      if (!lastSpawnCheck.current.lastSpawnTime || now - lastSpawnCheck.current.lastSpawnTime > 1000) {
        const spawnEvents = mobManagerRef.current.updateMobSpawning(playerPositionRef.current, currentZoneRef.current);
        if (spawnEvents.length > 0) {
          console.log('MobRenderer: Spawn events:', spawnEvents.length);
        }
        lastSpawnCheck.current.lastSpawnTime = now;
      }
      
        setMobs(updateResult.mobs);

      // Handle mob events
      updateResult.events.forEach(event => {
        if (event.type === 'DEATH') {
          console.log(`Mob ${event.mobId} died! XP: ${event.data.xp}, Gold: ${event.data.gold}`);
        }
      });
    }, 100); // 10fps instead of 60fps

    return () => clearInterval(updateInterval);
  }, []); // NO DEPENDENCIES - uses refs for current values

  // Old renderEnemy function removed - now using canvas-based rendering
  const renderEnemy = (enemy: Enemy) => {
    if (!enemy.isAlive()) return null;

    const { x, y } = enemy.position;
    const { size } = enemy.stats;
    
    // Convert world coordinates to screen coordinates
    // Use the same coordinate system as GameCanvas NPCs (player at center)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const screenX = centerX + (x - playerPosition.x);
    const screenY = centerY + (y - playerPosition.y);
    
    // RENDER DISTANCE OPTIONS:
    // Option 1: Extended render distance (current) - prevents "fog of war" effect
    // Option 2: Zone-based rendering - render all enemies in current zone
    // Option 3: Dynamic render distance - based on spawn distance
    
    // Current: Extended render distance (screen + 50% on each side)
    const renderMarginX = window.innerWidth * 0.5; // 50% of screen width on each side
    const renderMarginY = window.innerHeight * 0.5; // 50% of screen height on each side
    
    if (screenX < -renderMarginX || screenX > window.innerWidth + renderMarginX || 
        screenY < -renderMarginY || screenY > window.innerHeight + renderMarginY) {
      return null;
    }
    
    // Determine enemy color based on type and behavior
    let color = '#666';
    let shape = 'triangle'; // Default to triangle, never square
    
    switch (enemy.type) {
      case 'DUMMY':
        color = '#999';
        shape = 'circle'; // Dummy is a circle
        break;
      case 'HEX_PEACEFUL':
        color = '#4CAF50';
        shape = 'hexagon';
        break;
      case 'TRI_SMALL':
        color = '#FF9800';
        shape = 'triangle';
        break;
      case 'TRI_AGGRESSIVE':
        color = '#F44336';
        shape = 'triangle';
        break;
      case 'TRI_MEDIUM':
        color = '#E91E63';
        shape = 'triangle';
        break;
      case 'TRI_ELITE':
        color = '#9C27B0';
        shape = 'triangle';
        break;
    }

    // Add attack indicator
    const isAttacking = enemy.isAttacking;
    const attackIndicator = isAttacking ? (
      <div
        className="absolute border-2 border-red-500 rounded-full animate-pulse"
        style={{
          width: size + 20,
          height: size + 20,
          left: screenX - size/2 - 10,
          top: screenY - size/2 - 10,
          pointerEvents: 'none'
        }}
      />
    ) : null;

    return (
      <div key={enemy.id} className="absolute">
        {/* Enemy body */}
        <div
          className={`absolute ${shape === 'triangle' ? 'triangle' : shape === 'hexagon' ? 'hexagon' : 'circle'}`}
          style={{
            width: size,
            height: size,
            left: screenX - size/2,
            top: screenY - size/2,
            backgroundColor: color,
            border: '2px solid #fff',
            pointerEvents: 'none'
          }}
        />
        
        {/* HP bar */}
        {enemy.stats.hp < enemy.stats.maxHp && (
          <div
            className="absolute bg-red-500"
            style={{
              width: size,
              height: 3,
              left: screenX - size/2,
              top: screenY - size/2 - 8,
              pointerEvents: 'none'
            }}
          >
            <div
              className="bg-green-500 h-full"
              style={{
                width: `${(enemy.stats.hp / enemy.stats.maxHp) * 100}%`
              }}
            />
          </div>
        )}

        {/* Attack indicator */}
        {attackIndicator}

        {/* Counterattack window indicator */}
        {enemy.canBeCounterattacked() && (
          <div
            className="absolute border-2 border-yellow-400 rounded-full animate-ping"
            style={{
              width: size + 30,
              height: size + 30,
              left: screenX - size/2 - 15,
              top: screenY - size/2 - 15,
              pointerEvents: 'none',
              animationDuration: `${enemy.counterWindow}ms`
            }}
          />
        )}
      </div>
    );
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 10 // Above the main game canvas
      }}
    />
  );
};
