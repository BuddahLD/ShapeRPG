/**
 * Component: EnemyRenderer
 * Renders enemies on the game canvas
 */

import React, { useEffect, useState, useRef } from 'react';
import { Enemy } from '../domain/entities/Enemy';
import { EnemyManager } from '../application/services/EnemyManager';
import { AppBootstrapService } from '../application/AppBootstrapService';

interface EnemyRendererProps {
  currentZone: string;
  playerPosition: { x: number; y: number };
}

export const EnemyRenderer: React.FC<EnemyRendererProps> = ({ 
  currentZone, 
  playerPosition 
}) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [enemyManager] = useState(() => AppBootstrapService.getInstance().getEnemyManager());
  const lastSpawnCheck = useRef({ x: 0, y: 0, zone: '' });
  const spawnCheckDistance = 50; // Only check spawns when player moves 50 units

  // Initial spawn check and zone change detection
  useEffect(() => {
    console.log('EnemyRenderer: Spawn check triggered for zone:', currentZone, 'player pos:', playerPosition);
    console.log('EnemyRenderer: Player position type:', typeof playerPosition, 'keys:', Object.keys(playerPosition));
    
    // Only proceed if player position is valid
    if (playerPosition && typeof playerPosition.x === 'number' && typeof playerPosition.y === 'number') {
      console.log('EnemyRenderer: Calling updateEnemySpawning with position:', playerPosition, 'zone:', currentZone);
      const spawnEvents = enemyManager.updateEnemySpawning(playerPosition, currentZone);
      const allEnemies = enemyManager.getAllEnemies();
      console.log('EnemyRenderer: Spawn events:', spawnEvents.length, spawnEvents.map(e => e.type));
      console.log('EnemyRenderer: All enemies after spawn check:', allEnemies.length, allEnemies.map(e => ({ id: e.id, type: e.type, position: e.position })));
      setEnemies(allEnemies);
      lastSpawnCheck.current = { x: playerPosition.x, y: playerPosition.y, zone: currentZone };
    } else {
      console.warn('EnemyRenderer: Invalid player position:', playerPosition);
    }
  }, [currentZone, playerPosition.x, playerPosition.y, enemyManager]); // Run when zone or position changes


  useEffect(() => {
    // Update enemies every frame and check for new spawns
    const updateInterval = setInterval(() => {
      // Update existing enemies
      const updateResult = enemyManager.updateEnemies(16, Date.now()); // 60fps
      
      // Check for new spawns every 100ms (10 times per second)
      const now = Date.now();
      if (!lastSpawnCheck.current.lastSpawnTime || now - lastSpawnCheck.current.lastSpawnTime > 100) {
        console.log('EnemyRenderer: Periodic spawn check at', now);
        const spawnEvents = enemyManager.updateEnemySpawning(playerPosition, currentZone);
        if (spawnEvents.length > 0) {
          console.log('EnemyRenderer: Periodic spawn events:', spawnEvents.length);
        }
        lastSpawnCheck.current.lastSpawnTime = now;
      }
      
      setEnemies(updateResult.enemies);

      // Handle enemy events
      updateResult.events.forEach(event => {
        if (event.type === 'DEATH') {
          console.log(`Enemy ${event.enemyId} died! XP: ${event.data.xp}, Gold: ${event.data.gold}`);
        }
      });
    }, 16);

    return () => clearInterval(updateInterval);
  }, [enemyManager, playerPosition, currentZone]);

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
    <div className="absolute inset-0 pointer-events-none">
      {enemies.map(renderEnemy)}
    </div>
  );
};
