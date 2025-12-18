/**
 * Items module - Item definitions, inventory management
 */

export const ITEM_TYPES = {
    POTION: 'potion',
    GOLD: 'gold',
    KEY: 'key',
    WEAPON: 'weapon',
    ARMOR: 'armor'
};

export function createItem(type, x, y, data = {}) {
    return {
        id: `item_${Date.now()}_${Math.random()}`,
        type,
        x,
        y,
        width: 16,
        height: 16,
        collected: false,
        ...data
    };
}

export function createPotion(x, y, healAmount = 10) {
    return createItem(ITEM_TYPES.POTION, x, y, {
        healAmount,
        color: '#ff00ff',
        name: 'Health Potion'
    });
}

export function createGold(x, y, amount = 5) {
    return createItem(ITEM_TYPES.GOLD, x, y, {
        amount,
        color: '#ffd700',
        name: 'Gold'
    });
}

export function createKey(x, y, keyId = 'key_1') {
    return createItem(ITEM_TYPES.KEY, x, y, {
        keyId,
        color: '#ffff00',
        name: 'Key'
    });
}

export function collectItem(item, player) {
    if (item.collected) return false;
    
    item.collected = true;
    
    switch (item.type) {
        case ITEM_TYPES.POTION:
            player.inventory.push({ type: 'potion', healAmount: item.healAmount });
            return { message: `Found ${item.name}!`, type: 'potion' };
            
        case ITEM_TYPES.GOLD:
            player.gold += item.amount;
            return { message: `Found ${item.amount} gold!`, type: 'gold' };
            
        case ITEM_TYPES.KEY:
            player.keys++;
            player.inventory.push({ type: 'key', keyId: item.keyId });
            return { message: `Found a key!`, type: 'key' };
            
        default:
            return { message: `Found ${item.name || 'item'}!`, type: 'item' };
    }
}

export function useItem(item, player) {
    if (item.type === 'potion') {
        const healAmount = item.healAmount || 10;
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        return { message: `Used potion! Restored ${healAmount} HP.`, success: true };
    }
    return { message: 'Cannot use this item.', success: false };
}

export function spawnItems(tiles, width, height, count) {
    const items = [];
    
    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * width) * 32;
        const y = Math.floor(Math.random() * height) * 32;
        
        const rand = Math.random();
        if (rand < 0.4) {
            items.push(createGold(x, y, Math.floor(Math.random() * 10) + 5));
        } else if (rand < 0.7) {
            items.push(createPotion(x, y));
        } else {
            items.push(createKey(x, y, `key_${i}`));
        }
    }
    
    return items;
}


