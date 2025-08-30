interface PlayerStats {
  hp: number;
  mana: number;
  atk: number;
  def: number;
  castSpeed: number;
}

export class Player {
  public x: number = 0;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public stats: PlayerStats;
  public level: number;
  public xp: number;
  public gold: number;
  public spells: string[];

  constructor(
    level: number = 1,
    xp: number = 0,
    gold: number = 0,
    stats: PlayerStats,
    spells: string[] = []
  ) {
    this.level = level;
    this.xp = xp;
    this.gold = gold;
    this.stats = { ...stats };
    this.spells = [...spells];
  }

  public move(dx: number, dy: number, speed: number = 2): void {
    this.x += dx * speed;
    this.y += dy * speed;
    this.vx = dx * speed;
    this.vy = dy * speed;
  }

  public takeDamage(damage: number): number {
    const actualDamage = Math.max(1, damage - this.stats.def);
    this.stats.hp = Math.max(0, this.stats.hp - actualDamage);
    return actualDamage;
  }

  public heal(amount: number): void {
    this.stats.hp = Math.min(100, this.stats.hp + amount);
  }

  public useMana(amount: number): boolean {
    if (this.stats.mana >= amount) {
      this.stats.mana -= amount;
      return true;
    }
    return false;
  }

  public restoreMana(amount: number): void {
    this.stats.mana = Math.min(50, this.stats.mana + amount);
  }

  public addXP(amount: number): boolean {
    this.xp += amount;
    const xpRequired = 100 * Math.pow(this.level, 2);
    
    if (this.xp >= xpRequired) {
      this.levelUp();
      this.xp -= xpRequired;
      return true;
    }
    
    return false;
  }

  private levelUp(): void {
    this.level++;
    // Add stat bonuses on level up
    this.stats.hp += 10;
    this.stats.mana += 5;
    this.stats.atk += 1;
    this.stats.def += 1;
    
    console.log(`Player leveled up to ${this.level}!`);
  }

  public isAlive(): boolean {
    return this.stats.hp > 0;
  }
}
