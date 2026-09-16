// player.js - Handles player stats, leveling, and attributes for Dark Realms

export class Player {
  constructor(name = "Hero") {
    this.name = name;
    this.level = 1;
    this.xp = 0;
    this.hp = 100;
    this.maxHp = 100;
    this.str = 10;
    this.dex = 10;
    this.int = 10;
    this.inventory = [];
    // Add other attributes as needed
  }

  gainXP(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToLevel()) {
      this.levelUp();
    }
  }

  xpToLevel() {
    return this.level * 100;
  }

  levelUp() {
    this.level++;
    this.xp = 0;
    this.maxHp += 10;
    this.hp = this.maxHp;
    this.str += 2;
    this.dex += 2;
    this.int += 2;
    // Add level-up logic as needed
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
  }

  heal(amount) {
    this.hp += amount;
    if (this.hp > this.maxHp) this.hp = this.maxHp;
  }

  addItem(item) {
    this.inventory.push(item);
  }

  // Add more player methods as needed
}
