/**
 * Main game module - Game loop, initialization
 * This is the entry point that ties all modules together
 */

import { createPlayer, gainXP, levelUp } from './player.js';
import { generateTiles, isWalkable, createDoor, createChest, createNPC } from './world.js';
import { spawnEnemies, updateAllEnemies } from './enemies.js';
import { spawnItems, collectItem } from './items.js';
import { InputHandler } from './input.js';

// Import UI and rendering modules (to be created)
// import { renderWorld, renderPlayer, renderEnemies, renderItems } from './render.js';
// import { initUI, updateUI } from './ui.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.input = new InputHandler();
        this.gameState = 'characterCreation'; // characterCreation, playing, paused, gameOver
        this.player = null;
        this.world = {
            tiles: [],
            width: 50,
            height: 40,
            doors: [],
            chests: [],
            npcs: []
        };
        this.enemies = [];
        this.items = [];
        this.camera = { x: 0, y: 0 };
        this.lastFrameTime = performance.now();
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        // Initialize character creation UI
        // this.initCharacterCreation();
    }
    
    resizeCanvas() {
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;
        
        const devicePixelRatio = window.devicePixelRatio || 1;
        const availableWidth = gameArea.offsetWidth - 20;
        const uiPanelWidth = window.innerWidth > 1200 ? 280 : Math.min(280, availableWidth * 0.3);
        const maxCanvasWidth = availableWidth - uiPanelWidth;
        
        const aspectRatio = 4 / 3;
        const maxWidth = Math.min(800, maxCanvasWidth);
        const maxHeight = Math.min(600, window.innerHeight - 300);
        
        const canvasWidth = Math.max(400, Math.min(maxWidth, maxHeight * aspectRatio));
        const canvasHeight = canvasWidth / aspectRatio;
        
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        this.canvas.width = Math.round(canvasWidth * devicePixelRatio);
        this.canvas.height = Math.round(canvasHeight * devicePixelRatio);
        this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    
    startGame(playerData) {
        this.player = createPlayer(
            playerData.name,
            playerData.race,
            playerData.class,
            playerData.attributes
        );
        
        this.world.tiles = generateTiles(this.world.width, this.world.height);
        this.enemies = spawnEnemies(this.world.tiles, this.world.width, this.world.height, 10, 1);
        this.items = spawnItems(this.world.tiles, this.world.width, this.world.height, 15);
        
        this.gameState = 'playing';
        this.gameLoop();
    }
    
    gameLoop() {
        const now = performance.now();
        const dt = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        if (this.gameState === 'playing') {
            this.update(dt);
            this.render();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(dt) {
        // Update player movement
        const movement = this.input.getMovement();
        if (movement.dx !== 0 || movement.dy !== 0) {
            this.updatePlayerMovement(movement, dt);
        }
        
        // Update enemies
        this.enemies = updateAllEnemies(
            this.enemies,
            this.player,
            this.world.tiles,
            this.world.width,
            dt
        );
        
        // Check item collection
        this.checkItemCollection();
        
        // Update camera
        this.updateCamera();
    }
    
    updatePlayerMovement(movement, dt) {
        if (this.player.moveCooldown > 0) {
            this.player.moveCooldown -= dt;
            return;
        }
        
        const newX = this.player.gridX + movement.dx;
        const newY = this.player.gridY + movement.dy;
        
        if (isWalkable(this.world.tiles, this.world.width, newX, newY)) {
            this.player.gridX = newX;
            this.player.gridY = newY;
            this.player.moveCooldown = 200; // 200ms cooldown
        }
    }
    
    checkItemCollection() {
        this.items.forEach(item => {
            if (!item.collected) {
                const dx = this.player.gridX * 32 - item.x;
                const dy = this.player.gridY * 32 - item.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 32) {
                    const result = collectItem(item, this.player);
                    // Show message to player
                    console.log(result.message);
                }
            }
        });
    }
    
    updateCamera() {
        this.camera.x = this.player.gridX * 32 - this.canvas.width / 2;
        this.camera.y = this.player.gridY * 32 - this.canvas.height / 2;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render world, player, enemies, items
        // This would call render functions from render.js
        // For now, just a placeholder
        this.ctx.fillStyle = '#4a4a4a';
        this.ctx.fillRect(
            this.player.gridX * 32 - this.camera.x,
            this.player.gridY * 32 - this.camera.y,
            32,
            32
        );
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.game = new Game();
    });
} else {
    window.game = new Game();
}


