
import { BlockType } from '../types/main';

export const VISUAL_CONSTANTS = {
    BLOCK_SIZE: 32,
    PLAYER_WIDTH: 28,
    PLAYER_HEIGHT: 60,
    SKY_COLOR_TOP: 0x87ceeb,
    SKY_COLOR_BOTTOM: 0x4682b4,
    PLACEMENT_PREVIEW_VALID_COLOR: 0x00ff00,
    PLACEMENT_PREVIEW_INVALID_COLOR: 0xff0000,
    MINING_CRACK_COLOR: 0x000000,
    BLOCK_COLORS: {
        [BlockType.GRASS]: 0x6a9b4a,
        [BlockType.DIRT]: 0x8b5a2b,
        [BlockType.STONE]: 0x808080,
        [BlockType.WOOD]: 0x966F33,
        [BlockType.LEAVES]: 0x228B22,
        [BlockType.BEDROCK]: 0x333333,
    } as Record<BlockType, number>,
};
