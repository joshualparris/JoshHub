/**
 * Combat module - Combat system, damage calculation
 */

import { takeDamage, isAlive } from './player.js';

export const ENEMY_TYPES = {
    bandit: { name: 'Bandit', color: '#654321', hpMult: 1.0, attackMult: 1.0 },
    undead: { name: 'Undead', color: '#4a4a4a', hpMult: 1.2, attackMult: 0.9 },
    beast: { name: 'Dire Wolf', color: '#2a2a2a', hpMult: 0.9, attackMult: 1.2 },
    cultist: { name: 'Cultist', color: '#5a1a1a', hpMult: 0.8, attackMult: 1.3 }
};

export function createEnemy(type, x, y, level = 1) {
    const enemyData = ENEMY_TYPES[type] || ENEMY_TYPES.bandit;
    const baseHp = Math.floor(10 * enemyData.hpMult * (1 + level * 0.2));
    const baseAttack = Math.floor(3 * enemyData.attackMult * (1 + level * 0.15));
    
    return {
        id: `enemy_${Date.now()}_${Math.random()}`,
        type,
        x,
        y,
        width: 32,
        height: 32,
        hp: baseHp,
        maxHp: baseHp,
        attack: baseAttack,
        speed: 50 + (level * 5),
        color: enemyData.color,
        name: enemyData.name,
        targetX: x,
        targetY: y,
        moveTimer: 0,
        aggroRange: 150,
        chaseSpeed: 80
    };
}

export function calculateDamage(attacker, defender, isMagic = false) {
    const baseDamage = isMagic ? attacker.magicPower : attacker.attack;
    const variance = Math.random() * 0.4 - 0.2; // ±20% variance
    const damage = Math.max(1, Math.floor(baseDamage * (1 + variance)));
    return damage;
}

export function attackEnemy(player, enemy) {
    const damage = calculateDamage(player, enemy);
    enemy.hp -= damage;
    return { damage, killed: enemy.hp <= 0 };
}

export function attackPlayer(enemy, player) {
    const damage = calculateDamage(enemy, player);
    takeDamage(player, damage);
    return { damage, killed: !isAlive(player) };
}

export function canAttack(player, enemy) {
    const dx = player.gridX - enemy.x;
    const dy = player.gridY - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 50; // Attack range
}


