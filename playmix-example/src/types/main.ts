
export enum BlockType {
    EMPTY,
    GRASS,
    DIRT,
    STONE,
    WOOD,
    LEAVES,
    BEDROCK
}

export interface InventorySlot {
    item: BlockType | null;
    quantity: number;
}

export interface BlockInfo {
    name: string;
    hardness: number; // Multiplier for mining duration
    drop: BlockType | null; // What item it drops, null if it drops nothing
}
