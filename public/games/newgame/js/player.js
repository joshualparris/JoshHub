/**
 * Player module - Character stats, leveling, attributes
 */

export const RACE_BONUSES = {
    human: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    elf: { dex: 2, wis: 1 },
    dwarf: { con: 2, str: 1 },
    orc: { str: 2, con: 1 }
};

export const CLASS_BONUSES = {
    warrior: { str: 3, con: 2, dex: 1 },
    rogue: { dex: 3, int: 2, str: 1 },
    mage: { int: 3, wis: 2, con: 1 },
    ranger: { dex: 2, wis: 2, con: 1, str: 1 }
};

export function createPlayer(name, race, classType, attributes) {
    const raceBonus = RACE_BONUSES[race] || {};
    const classBonus = CLASS_BONUSES[classType] || {};
    
    // Calculate base stats
    const baseHp = 10 + (attributes.con * 2);
    const attack = attributes.str + (classBonus.str || 0);
    const defense = attributes.con + (classBonus.con || 0);
    const magicPower = attributes.int + (classBonus.int || 0);
    
    return {
        name,
        race,
        class: classType,
        gridX: 10,
        gridY: 10,
        width: 32,
        height: 32,
        hp: baseHp,
        maxHp: baseHp,
        level: 1,
        xp: 0,
        xpToNext: 100,
        gold: 25,
        inventory: [],
        keys: 0,
        attributes: {
            str: attributes.str + (raceBonus.str || 0) + (classBonus.str || 0),
            dex: attributes.dex + (raceBonus.dex || 0) + (classBonus.dex || 0),
            con: attributes.con + (raceBonus.con || 0) + (classBonus.con || 0),
            int: attributes.int + (raceBonus.int || 0) + (classBonus.int || 0),
            wis: attributes.wis + (raceBonus.wis || 0) + (classBonus.wis || 0),
            cha: attributes.cha + (raceBonus.cha || 0) + (classBonus.cha || 0)
        },
        attack,
        defense,
        magicPower,
        moveCooldown: 0,
        hitTimer: 0,
        damageNumber: null,
        damageNumberTimer: 0
    };
}

export function gainXP(player, amount) {
    player.xp += amount;
    if (player.xp >= player.xpToNext) {
        levelUp(player);
    }
}

export function levelUp(player) {
    player.level++;
    player.xp -= player.xpToNext;
    player.xpToNext = Math.floor(player.xpToNext * 1.5);
    
    // Increase stats on level up
    player.maxHp += 5;
    player.hp = player.maxHp; // Full heal on level up
    player.attack += 1;
    player.defense += 1;
    player.magicPower += 1;
    
    return true; // Level up occurred
}

export function takeDamage(player, amount) {
    const actualDamage = Math.max(1, amount - Math.floor(player.defense / 2));
    player.hp = Math.max(0, player.hp - actualDamage);
    return actualDamage;
}

export function heal(player, amount) {
    player.hp = Math.min(player.maxHp, player.hp + amount);
}

export function isAlive(player) {
    return player.hp > 0;
}


