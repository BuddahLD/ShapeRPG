/**
 * Application Use Case: Spell Casting
 * Orchestrates spell casting operations
 */

import { Player } from '../../domain/entities/Player';
import { Mob } from '../../domain/entities/Mob';
import { Spell } from '../../domain/valueObjects/Spell';
import { IPlayerRepository } from '../../domain/interfaces/repositories/IPlayerRepository';
import { ICombatService, SpellCastResult } from '../../domain/interfaces/services/ICombatService';

export interface CastSpellRequest {
  readonly playerId: string;
  readonly spellId: string;
  readonly targetId?: string; // Optional for self-target spells
  readonly accuracy: number; // 0.0 to 1.0 based on rune drawing accuracy
}

export interface CastSpellResponse {
  readonly success: boolean;
  readonly castResult: SpellCastResult | null;
  readonly updatedPlayer: Player;
  readonly updatedTarget: Player | Mob | null;
  readonly errorMessage?: string;
}

export interface LearnSpellRequest {
  readonly playerId: string;
  readonly spellId: string;
}

export interface LearnSpellResponse {
  readonly success: boolean;
  readonly updatedPlayer: Player;
  readonly spellAlreadyKnown: boolean;
}

export class SpellCastingUseCase {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly combatService: ICombatService,
    private readonly spellRepository: ISpellRepository // This would need to be defined
  ) {}

  async castSpell(request: CastSpellRequest): Promise<CastSpellResponse> {
    // Get player
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      return {
        success: false,
        castResult: null,
        updatedPlayer: player!,
        updatedTarget: null,
        errorMessage: `Player not found: ${request.playerId}`
      };
    }

    if (!player.isAlive()) {
      return {
        success: false,
        castResult: null,
        updatedPlayer: player,
        updatedTarget: null,
        errorMessage: 'Player is not alive'
      };
    }

    // Get spell (this would come from a spell repository)
    const spell = await this.getSpellById(request.spellId);
    if (!spell) {
      return {
        success: false,
        castResult: null,
        updatedPlayer: player,
        updatedTarget: null,
        errorMessage: `Spell not found: ${request.spellId}`
      };
    }

    // Check if player knows the spell
    if (!player.knownSpells.has(request.spellId)) {
      return {
        success: false,
        castResult: null,
        updatedPlayer: player,
        updatedTarget: null,
        errorMessage: `Player does not know spell: ${spell.name}`
      };
    }

    // Check mana requirements
    if (!player.canCastSpell(request.spellId, spell.manaCost)) {
      return {
        success: false,
        castResult: null,
        updatedPlayer: player,
        updatedTarget: null,
        errorMessage: `Not enough mana to cast ${spell.name}`
      };
    }

    // Determine target
    const target = await this.getTarget(request.targetId, request.playerId);
    if (!target && request.targetId) {
      return {
        success: false,
        castResult: null,
        updatedPlayer: player,
        updatedTarget: null,
        errorMessage: 'Target not found'
      };
    }

    // Apply accuracy modifier to spell
    const modifiedSpell = spell.withAccuracyModifier(request.accuracy);

    try {
      // Cast spell through combat service
      const castResult = await this.combatService.castSpell(
        player,
        target || player, // Self-target if no target specified
        modifiedSpell,
        request.accuracy
      );

      return {
        success: castResult.success,
        castResult,
        updatedPlayer: castResult.caster,
        updatedTarget: castResult.target === castResult.caster ? null : castResult.target,
        errorMessage: castResult.success ? undefined : 'Spell casting failed'
      };
    } catch (error) {
      return {
        success: false,
        castResult: null,
        updatedPlayer: player,
        updatedTarget: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async learnSpell(request: LearnSpellRequest): Promise<LearnSpellResponse> {
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error(`Player not found: ${request.playerId}`);
    }

    const spellAlreadyKnown = player.knownSpells.has(request.spellId);
    if (spellAlreadyKnown) {
      return {
        success: true,
        updatedPlayer: player,
        spellAlreadyKnown: true
      };
    }

    // Verify spell exists
    const spell = await this.getSpellById(request.spellId);
    if (!spell) {
      throw new Error(`Spell not found: ${request.spellId}`);
    }

    // Check level requirements
    if (!spell.canBeCastByLevel(player.level)) {
      throw new Error(`Player level ${player.level} is too low for ${spell.name} (requires level ${spell.level})`);
    }

    const updatedPlayer = player.learnSpell(request.spellId);
    await this.playerRepository.save(updatedPlayer);

    return {
      success: true,
      updatedPlayer,
      spellAlreadyKnown: false
    };
  }

  private async getSpellById(spellId: string): Promise<Spell | null> {
    // This would be implemented with a proper spell repository
    // For now, return null to indicate incomplete implementation
    return null;
  }

  private async getTarget(targetId: string | undefined, playerId: string): Promise<Player | Mob | null> {
    if (!targetId) return null;
    
    // This would check both player and mob repositories
    // For now, return null to indicate incomplete implementation
    return null;
  }
}

// This interface would need to be defined in the domain layer
interface ISpellRepository {
  findById(id: string): Promise<Spell | null>;
  findAll(): Promise<Spell[]>;
  findByPattern(pattern: string): Promise<Spell[]>;
}