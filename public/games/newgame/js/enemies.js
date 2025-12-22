/**
 * Enemies module - Enemy AI, spawning, behavior
 */

import { createEnemy } from './combat.js';
import { isWalkable } from './world.js';

export function spawnEnemies(tiles, width, height, count, level = 1) {
    const enemies = [];
    const enemyTypes = ['bandit', 'undead', 'beast', 'cultist'];
    
    for (let i = 0; i < count; i++) {
        let attempts = 0;
        let x, y;
        
        // Find valid spawn position
        do {
            x = Math.floor(Math.random() * width);
            y = Math.floor(Math.random() * height);
            attempts++;
        } while (!isWalkable(tiles, width, x, y) && attempts < 50);
        
        if (attempts < 50) {
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemy = createEnemy(type, x * 32, y * 32, level);
            enemies.push(enemy);
        }
    }
    
    return enemies;
}

export function updateEnemyAI(enemy, player, tiles, width, dt) {
    const dx = player.gridX - enemy.x;
    const dy = player.gridY - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Aggro if player is within range
    if (distance < enemy.aggroRange) {
        // Move towards player
        const angle = Math.atan2(dy, dx);
        const moveSpeed = enemy.chaseSpeed * (dt / 1000);
        
        enemy.x += Math.cos(angle) * moveSpeed;
        enemy.y += Math.sin(angle) * moveSpeed;
        
        // Keep enemy on grid
        enemy.x = Math.floor(enemy.x / 32) * 32;
        enemy.y = Math.floor(enemy.y / 32) * 32;
    } else {
        // Idle movement
        enemy.moveTimer += dt;
        if (enemy.moveTimer > 2000) {
            enemy.targetX = enemy.x + (Math.random() - 0.5) * 64;
            enemy.targetY = enemy.y + (Math.random() - 0.5) * 64;
            enemy.moveTimer = 0;
        }
        
        const targetDx = enemy.targetX - enemy.x;
        const targetDy = enemy.targetY - enemy.y;
        const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
        
        if (targetDist > 5) {
            const angle = Math.atan2(targetDy, targetDx);
            const moveSpeed = enemy.speed * (dt / 1000);
            enemy.x += Math.cos(angle) * moveSpeed;
            enemy.y += Math.sin(angle) * moveSpeed;
        }
    }
    
    return enemy;
}

export function updateAllEnemies(enemies, player, tiles, width, dt) {
    return enemies
        .filter(enemy => enemy.hp > 0)
        .map(enemy => updateEnemyAI(enemy, player, tiles, width, dt));
}


