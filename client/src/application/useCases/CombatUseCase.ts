/**
 * Application Use Case: Combat Operations
 * Orchestrates all combat-related operations
 */

import { Player } from '../../domain/entities/Player';
import { Mob } from '../../domain/entities/Mob';
import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';
import { ICombatService, CombatResult } from '../../domain/interfaces/services/ICombatService';

export interface AttackMobRequest {
  readonly playerId: string;
  readonly mobId: string;
  readonly isCounterattack?: boolean;
}

export interface AttackMobResponse {
  readonly success: boolean;
  readonly combatResult: CombatResult | null;
  readonly playerLeveledUp: boolean;
  readonly mobDefeated: boolean;
  readonly updatedPlayer: Player;
  readonly updatedMob: Mob | null;
}

export interface MobAttackPlayerRequest {
  readonly playerId: string;
  readonly mobId: string;
}

export interface MobAttackPlayerResponse {
  readonly success: boolean;
  readonly combatResult: CombatResult | null;
  readonly playerDefeated: boolean;
  readonly updatedPlayer: Player;
  readonly updatedMob: Mob;
}

export class CombatUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly combatService: ICombatService
  ) {}

  async attackMob(request: AttackMobRequest): Promise<AttackMobResponse> {
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error(`Player not found: ${request.playerId}`);
    }

    if (!player.isAlive()) {
      throw new Error('Player is not alive');
    }

    // Note: Mob would come from a mob repository in a complete implementation
    // For now, assuming mob is passed or retrieved from somewhere
    // This is where we'd inject an IMobRepository
    throw new Error('Mob repository not implemented yet');
  }

  async mobAttackPlayer(request: MobAttackPlayerRequest): Promise<MobAttackPlayerResponse> {
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error(`Player not found: ${request.playerId}`);
    }

    if (!player.isAlive()) {
      throw new Error('Player is not alive');
    }

    // Note: Mob would come from a mob repository in a complete implementation
    throw new Error('Mob repository not implemented yet');
  }

  async performCounterattack(request: AttackMobRequest): Promise<AttackMobResponse> {
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error(`Player not found: ${request.playerId}`);
    }

    if (!player.isAlive()) {
      throw new Error('Player is not alive');
    }

    // Note: Mob would come from a mob repository in a complete implementation
    throw new Error('Mob repository not implemented yet');
  }

  private async handleCombatResult(
    combatResult: CombatResult,
    mob: Mob
  ): Promise<{ playerLeveledUp: boolean; mobDefeated: boolean; updatedPlayer: Player }> {
    let updatedPlayer = combatResult.attacker as Player;
    let playerLeveledUp = false;
    const mobDefeated = !mob.isAlive();

    if (mobDefeated) {
      // Award experience and gold
      const expGain = mob.getExperienceValue();
      const goldGain = mob.getGoldValue();

      const expResult = updatedPlayer.addExperience(expGain);
      updatedPlayer = expResult.player.addGold(goldGain);
      playerLeveledUp = expResult.leveledUp;
    }

    // Save updated player
    await this.playerRepository.save(updatedPlayer);

    return { playerLeveledUp, mobDefeated, updatedPlayer };
  }
}