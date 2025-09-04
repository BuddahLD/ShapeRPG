/**
 * Component: EnemyRenderer
 * Renders enemies on the game canvas
 */

import React, { useEffect, useState } from 'react';
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

  // Initial spawn check
  useEffect(() => {
    console.log('EnemyRenderer: Initial spawn check for zone:', currentZone, 'player pos:', playerPosition);
    const spawnEvents = enemyManager.updateEnemySpawning(playerPosition, currentZone);
    setEnemies(enemyManager.getAllEnemies());
    lastSpawnCheck.current = { x: playerPosition.x, y: playerPosition.y, zone: currentZone };
  }, []); // Only run once on mount

  useEffect(() => {
    // Calculate distance from last spawn check
    const distance = Math.sqrt(
      Math.pow(playerPosition.x - lastSpawnCheck.current.x, 2) + 
      Math.pow(playerPosition.y - lastSpawnCheck.current.y, 2)
    );
    
    // Only update spawns if zone changed or player moved significantly
    const zoneChanged = currentZone !== lastSpawnCheck.current.zone;
    const movedSignificantly = distance >= spawnCheckDistance;
    
    if (zoneChanged || movedSignificantly) {
      console.log('EnemyRenderer: Updating spawns for zone:', currentZone, 'player pos:', playerPosition);
      const spawnEvents = enemyManager.updateEnemySpawning(playerPosition, currentZone);
      setEnemies(enemyManager.getAllEnemies());
      
      // Handle spawn events
      spawnEvents.forEach(event => {
        if (event.type === 'SPAWN') {
          console.log(`Enemy ${event.enemyId} spawned at position:`, event.data.enemy.position);
        }
      });
      
      console.log('Current enemies:', enemyManager.getAllEnemies().length);
      
      // Update last check position
      lastSpawnCheck.current = { x: playerPosition.x, y: playerPosition.y, zone: currentZone };
    }
  }, [currentZone, playerPosition, enemyManager]);

  useEffect(() => {
    // Update enemies every frame
    const updateInterval = setInterval(() => {
      const updateResult = enemyManager.updateEnemies(16, Date.now()); // 60fps
      setEnemies(updateResult.enemies);

      // Handle enemy events
      updateResult.events.forEach(event => {
        if (event.type === 'DEATH') {
          console.log(`Enemy ${event.enemyId} died! XP: ${event.data.xp}, Gold: ${event.data.gold}`);
        }
      });
    }, 16);

    return () => clearInterval(updateInterval);
  }, [enemyManager]);

  const renderEnemy = (enemy: Enemy) => {
    if (!enemy.isAlive()) return null;

    const { x, y } = enemy.position;
    const { size } = enemy.stats;
    
    // Convert world coordinates to screen coordinates
    // Assuming player is at center of screen
    const screenX = x - playerPosition.x + window.innerWidth / 2;
    const screenY = y - playerPosition.y + window.innerHeight / 2;
    
    // Only render if enemy is visible on screen (with some margin)
    const margin = 100;
    if (screenX < -margin || screenX > window.innerWidth + margin || 
        screenY < -margin || screenY > window.innerHeight + margin) {
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
