/**
 * Input module - Input handling, controls
 */

export class InputHandler {
    constructor() {
        this.keys = {};
        this.lastKey = null;
        this.setupListeners();
    }
    
    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.lastKey = e.code;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    isPressed(code) {
        return this.keys[code] || false;
    }
    
    getMovement() {
        let dx = 0;
        let dy = 0;
        
        if (this.isPressed('KeyW') || this.isPressed('ArrowUp')) {
            dy = -1;
        }
        if (this.isPressed('KeyS') || this.isPressed('ArrowDown')) {
            dy = 1;
        }
        if (this.isPressed('KeyA') || this.isPressed('ArrowLeft')) {
            dx = -1;
        }
        if (this.isPressed('KeyD') || this.isPressed('ArrowRight')) {
            dx = 1;
        }
        
        return { dx, dy };
    }
    
    isInteractPressed() {
        return this.isPressed('Space') || this.isPressed('KeyE');
    }
    
    isInventoryPressed() {
        return this.isPressed('KeyI');
    }
}


