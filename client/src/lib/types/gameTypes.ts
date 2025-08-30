// Core game types and enums
export type GamePhase = "hub" | "combat" | "ended";
export type LocationId = "LOC_HUB_FIGUREIUM" | "LOC_PEACEFUL_FIELDS" | "LOC_ARENA_1";
export type ShopType = "weapons" | "armor" | null;
export type EnemyType = "TRI_SMALL" | "TRI_MEDIUM" | "TRI_ARENA" | "HEX_PEACEFUL";
export type NPCType = "shop" | "trainer";

// Entity interfaces
export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  size: number;
  isAttacking: boolean;
  counterWindow: number;
  lastAttack: number;
}

export interface NPC {
  id: string;
  x: number;
  y: number;
  type: NPCType;
}

export interface WorldZone {
  id: LocationId;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  background: string;
  hasEnemies: boolean;
}

export interface WorldChunk {
  x: number;
  y: number;
  loaded: boolean;
  enemies: Enemy[];
  npcs: NPC[];
  walls: Wall[];
}

export interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Spell system types
export interface SpellCastResult {
  spell: any;
  accuracy: number;
  success: boolean;
}

// Chunk management types
export interface ChunkCoordinates {
  x: number;
  y: number;
}

export interface ChunkBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}