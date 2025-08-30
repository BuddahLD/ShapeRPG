import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Combat } from "./Combat";
import { SpellSystem } from "./SpellSystem";

export class GameEngine {
  private player: Player | null = null;
  private enemies: Enemy[] = [];
  private combat: Combat;
  private spellSystem: SpellSystem;
  private lastUpdateTime: number = 0;

  constructor() {
    this.combat = new Combat();
    this.spellSystem = new SpellSystem();
    console.log("Game Engine initialized");
  }

  public update(timeScale: number = 1.0): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    // Scaled delta time for slow motion effects
    const scaledDelta = deltaTime * timeScale;

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(scaledDelta);
    });

    // Update combat system
    this.combat.update(scaledDelta);

    // Update spell system
    this.spellSystem.update(scaledDelta);
  }

  public setPlayer(player: Player): void {
    this.player = player;
  }

  public addEnemy(enemy: Enemy): void {
    this.enemies.push(enemy);
  }

  public removeEnemy(enemyId: string): void {
    this.enemies = this.enemies.filter(enemy => enemy.id !== enemyId);
  }

  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  public getCombatSystem(): Combat {
    return this.combat;
  }

  public getSpellSystem(): SpellSystem {
    return this.spellSystem;
  }

  public destroy(): void {
    this.enemies = [];
    this.player = null;
    console.log("Game Engine destroyed");
  }
}
