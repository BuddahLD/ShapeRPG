/**
 * Application Use Case: Combat Operations
 * Orchestrates all combat-related operations
 */

import { Player } from '../../domain/entities/Player';
import { Enemy } from '../../domain/entities/Enemy';
import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';
import { ICombatService, CombatResult } from '../../domain/interfaces/services/ICombatService';

export interface AttackEnemyRequest {
  readonly playerId: string;
  readonly enemyId: string;
  readonly isCounterattack?: boolean;
}

export interface AttackEnemyResponse {
  readonly success: boolean;
  readonly combatResult: CombatResult | null;
  readonly playerLeveledUp: boolean;
  readonly enemyDefeated: boolean;
  readonly updatedPlayer: Player;
  readonly updatedEnemy: Enemy | null;
}

export interface EnemyAttackPlayerRequest {
  readonly playerId: string;
  readonly enemyId: string;
}

export interface EnemyAttackPlayerResponse {
  readonly success: boolean;
  readonly combatResult: CombatResult | null;
  readonly playerDefeated: boolean;
  readonly updatedPlayer: Player;
  readonly updatedEnemy: Enemy;
}

export class CombatUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly combatService: ICombatService
  ) {}

  async attackEnemy(request: AttackEnemyRequest): Promise<AttackEnemyResponse> {
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error(`Player not found: ${request.playerId}`);
    }

    if (!player.isAlive()) {
      throw new Error('Player is not alive');
    }

    // Note: Enemy would come from an enemy repository in a complete implementation
    // For now, assuming enemy is passed or retrieved from somewhere
    // This is where we'd inject an IEnemyRepository
    throw new Error('Enemy repository not implemented yet');
  }

  async enemyAttackPlayer(request: EnemyAttackPlayerRequest): Promise<EnemyAttackPlayerResponse> {
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error(`Player not found: ${request.playerId}`);
    }

    if (!player.isAlive()) {
      throw new Error('Player is not alive');
    }

    // Note: Enemy would come from an enemy repository in a complete implementation
    throw new Error('Enemy repository not implemented yet');
  }

  async performCounterattack(request: AttackEnemyRequest): Promise<AttackEnemyResponse> {
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error(`Player not found: ${request.playerId}`);
    }

    if (!player.isAlive()) {
      throw new Error('Player is not alive');
    }

    // Note: Enemy would come from an enemy repository in a complete implementation
    throw new Error('Enemy repository not implemented yet');
  }

  private async handleCombatResult(
    combatResult: CombatResult,
    enemy: Enemy
  ): Promise<{ playerLeveledUp: boolean; enemyDefeated: boolean; updatedPlayer: Player }> {
    let updatedPlayer = combatResult.attacker as Player;
    let playerLeveledUp = false;
    const enemyDefeated = !enemy.isAlive();

    if (enemyDefeated) {
      // Award experience and gold
      const expGain = enemy.getExperienceValue();
      const goldGain = enemy.getGoldValue();

      const expResult = updatedPlayer.addExperience(expGain);
      updatedPlayer = expResult.player.addGold(goldGain);
      playerLeveledUp = expResult.leveledUp;
    }

    // Save updated player
    await this.playerRepository.save(updatedPlayer);

    return { playerLeveledUp, enemyDefeated, updatedPlayer };
  }
}