export class Enemy {
  public id: string;
  public type: string;
  public x: number;
  public y: number;
  public hp: number;
  public maxHp: number;
  public atk: number;
  public def: number;
  public size: number;
  public isAttacking: boolean = false;
  public counterWindow: number = 0;
  public lastAttack: number = 0;
  private attackCooldown: number = 2000; // 2 seconds
  private attackWindowDuration: number = 1000; // 1 second counterattack window

  constructor(
    id: string,
    type: string,
    x: number,
    y: number,
    hp: number,
    atk: number,
    def: number,
    size: number = 20
  ) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.maxHp = hp;
    this.atk = atk;
    this.def = def;
    this.size = size;
  }

  public update(deltaTime: number): void {
    const currentTime = Date.now();
    
    // Update counterattack window
    if (this.counterWindow > 0) {
      this.counterWindow = Math.max(0, this.counterWindow - deltaTime);
      if (this.counterWindow === 0) {
        this.isAttacking = false;
      }
    }

    // AI behavior - attack periodically
    if (!this.isAttacking && currentTime - this.lastAttack > this.attackCooldown) {
      this.startAttack();
    }

    // Simple movement towards player (assuming player is at 0,0)
    if (!this.isAttacking) {
      const dx = -this.x;
      const dy = -this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 50) { // Stay at least 50 units away
        const speed = 0.5;
        this.x += (dx / distance) * speed;
        this.y += (dy / distance) * speed;
      }
    }
  }

  public startAttack(): void {
    this.isAttacking = true;
    this.counterWindow = this.attackWindowDuration;
    this.lastAttack = Date.now();
    
    console.log(`Enemy ${this.id} is attacking! Counterattack window opened.`);
  }

  public takeDamage(damage: number): number {
    const actualDamage = Math.max(1, damage - this.def);
    this.hp = Math.max(0, this.hp - actualDamage);
    
    if (this.hp === 0) {
      console.log(`Enemy ${this.id} defeated!`);
    }
    
    return actualDamage;
  }

  public isAlive(): boolean {
    return this.hp > 0;
  }

  public getDistanceToPlayer(playerX: number = 0, playerY: number = 0): number {
    const dx = this.x - playerX;
    const dy = this.y - playerY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public canBeCounterattacked(): boolean {
    return this.isAttacking && this.counterWindow > 0;
  }
}
