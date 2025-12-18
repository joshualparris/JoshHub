/**
 * World module - Map generation, tile management
 */

export const TILE_TYPES = {
    FLOOR: 0,
    WALL: 1,
    DOOR: 2,
    CHEST: 3,
    SHOP: 4,
    WATER: 5,
    GRASS: 6,
    GATE: 7
};

export function generateTiles(width, height) {
    const tiles = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Simple generation: walls on edges, floor in middle
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                tiles.push(TILE_TYPES.WALL);
            } else {
                // Random floor types
                const rand = Math.random();
                if (rand < 0.7) {
                    tiles.push(TILE_TYPES.FLOOR);
                } else if (rand < 0.85) {
                    tiles.push(TILE_TYPES.GRASS);
                } else {
                    tiles.push(TILE_TYPES.WATER);
                }
            }
        }
    }
    return tiles;
}

export function isWalkable(tiles, width, x, y) {
    if (x < 0 || y < 0 || x >= width || y >= Math.floor(tiles.length / width)) {
        return false;
    }
    const idx = y * width + x;
    const tile = tiles[idx];
    return tile === TILE_TYPES.FLOOR || 
           tile === TILE_TYPES.GRASS || 
           tile === TILE_TYPES.DOOR;
}

export function getTileAt(tiles, width, x, y) {
    if (x < 0 || y < 0 || x >= width || y >= Math.floor(tiles.length / width)) {
        return TILE_TYPES.WALL;
    }
    const idx = y * width + x;
    return tiles[idx] || TILE_TYPES.WALL;
}

export function createDoor(x, y, requiresKey = false, keyId = null) {
    return {
        x,
        y,
        width: 32,
        height: 32,
        open: false,
        requiresKey,
        keyId,
        type: 'door'
    };
}

export function createChest(x, y, loot = []) {
    return {
        x,
        y,
        width: 32,
        height: 32,
        open: false,
        loot,
        type: 'chest'
    };
}

export function createNPC(x, y, name, dialog = []) {
    return {
        x,
        y,
        width: 32,
        height: 32,
        name,
        dialog,
        type: 'npc'
    };
}


