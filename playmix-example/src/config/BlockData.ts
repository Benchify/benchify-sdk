
import { BlockType, BlockInfo } from '../types/main';

export const BLOCK_DATA: Record<BlockType, BlockInfo> = {
    [BlockType.EMPTY]: { name: 'Empty', hardness: 0, drop: null },
    [BlockType.GRASS]: { name: 'Grass Block', hardness: 1, drop: BlockType.DIRT },
    [BlockType.DIRT]: { name: 'Dirt', hardness: 1, drop: BlockType.DIRT },
    [BlockType.STONE]: { name: 'Stone', hardness: 2.5, drop: BlockType.STONE },
    [BlockType.WOOD]: { name: 'Wood', hardness: 2, drop: BlockType.WOOD },
    [BlockType.LEAVES]: { name: 'Leaves', hardness: 0.5, drop: null },
    [BlockType.BEDROCK]: { name: 'Bedrock', hardness: Infinity, drop: null },
};
