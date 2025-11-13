
import * as Phaser from 'phaser';
import { BlockType } from '../types/main';
import { VISUAL_CONSTANTS } from '../config/VisualConstants';
import { BALANCE_CONSTANTS } from '../config/BalanceConstants';

export class WorldManager {
    private scene: Phaser.Scene;
    private worldData: BlockType[][] = [];
    private worldTiles: (Phaser.GameObjects.Rectangle | null)[][] = [];
    public collisionGroup: Phaser.Physics.Arcade.StaticGroup;
    private seed: number;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.collisionGroup = this.scene.physics.add.staticGroup();
        this.seed = Math.random();
    }

    public generateWorld(): { spawnX: number, spawnY: number } {
        const { WORLD_WIDTH_IN_BLOCKS, WORLD_HEIGHT_IN_BLOCKS } = BALANCE_CONSTANTS;
        const { BLOCK_SIZE } = VISUAL_CONSTANTS;

        for (let x = 0; x < WORLD_WIDTH_IN_BLOCKS; x++) {
            this.worldData[x] = [];
            this.worldTiles[x] = [];
            
            const noiseValue = Phaser.Math.FloatBetween(this.seed + x, -1, 1);
            const surfaceHeight = Math.floor(WORLD_HEIGHT_IN_BLOCKS / 2) + Math.floor(noiseValue * 10);

            for (let y = 0; y < WORLD_HEIGHT_IN_BLOCKS; y++) {
                let blockType: BlockType;
                if (y > surfaceHeight + 5) {
                    blockType = BlockType.STONE;
                } else if (y > surfaceHeight) {
                    blockType = BlockType.DIRT;
                } else if (y === surfaceHeight) {
                    blockType = BlockType.GRASS;
                } else {
                    blockType = BlockType.EMPTY;
                }

                if (y >= WORLD_HEIGHT_IN_BLOCKS - 2) {
                    blockType = BlockType.BEDROCK;
                }

                this.worldData[x][y] = blockType;

                if (blockType !== BlockType.EMPTY && this.collisionGroup) {
                   this.createBlock(x, y, blockType);
                } else {
                    if (!this.worldTiles[x]) {
                        this.worldTiles[x] = [];
                    }
                    this.worldTiles[x][y] = null;
                }
            }
        }
        
        for (let x = 10; x < WORLD_WIDTH_IN_BLOCKS - 10; x++) {
            if (Math.random() < 0.1) {
                const surfaceY = this.findSurfaceY(x);
                if (surfaceY !== null && this.worldData[x][surfaceY] === BlockType.GRASS) {
                    this.generateTree(x, surfaceY - 1);
                }
            }
        }
        
        const spawnX = Math.floor(WORLD_WIDTH_IN_BLOCKS / 2) * BLOCK_SIZE;
        const spawnYGrid = this.findSurfaceY(Math.floor(WORLD_WIDTH_IN_BLOCKS / 2));
        const spawnY = (spawnYGrid ? spawnYGrid - 3 : WORLD_HEIGHT_IN_BLOCKS / 2) * BLOCK_SIZE;

        return { spawnX, spawnY };
    }

    private findSurfaceY(x: number): number | null {
         for (let y = 0; y < BALANCE_CONSTANTS.WORLD_HEIGHT_IN_BLOCKS; y++) {
            if (this.worldData[x]?.[y] !== BlockType.EMPTY) {
                return y;
            }
        }
        return null;
    }

    private generateTree(x: number, y: number): void {
        const trunkHeight = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < trunkHeight; i++) {
            if (y - i > 0) this.addBlock(x, y - i, BlockType.WOOD, true);
        }
        const leafRadius = 2;
        const topY = y - trunkHeight;
        for (let ly = -leafRadius; ly <= leafRadius; ly++) {
            for (let lx = -leafRadius; lx <= leafRadius; lx++) {
                if (lx * lx + ly * ly > leafRadius * leafRadius + 1) continue;
                const currentBlock = this.getBlockAtGrid(x + lx, topY + ly);
                if (currentBlock === BlockType.EMPTY) {
                    this.addBlock(x + lx, topY + ly, BlockType.LEAVES, true);
                }
            }
        }
    }

    private createBlock(gridX: number, gridY: number, type: BlockType): void {
        if (type === BlockType.EMPTY) return;
        const { BLOCK_SIZE, BLOCK_COLORS } = VISUAL_CONSTANTS;
        const x = gridX * BLOCK_SIZE + BLOCK_SIZE / 2;
        const y = gridY * BLOCK_SIZE + BLOCK_SIZE / 2;
        
        const tile = this.scene.add.rectangle(x, y, BLOCK_SIZE, BLOCK_SIZE, BLOCK_COLORS[type]);
        this.collisionGroup.add(tile);
        this.worldTiles[gridX][gridY] = tile;
    }

    public getBlockAtGrid(gridX: number, gridY: number): BlockType | null {
        if (gridX < 0 || gridX >= this.worldData.length || !this.worldData[gridX]) {
            return null;
        }
        if (gridY < 0 || gridY >= this.worldData[gridX].length) {
            return null;
        }
        return this.worldData[gridX][gridY] || null;
    }

    public removeBlock(gridX: number, gridY: number): void {
        if (gridX < 0 || gridY < 0 || 
            gridX >= this.worldData.length || 
            gridY >= (this.worldData[gridX]?.length ?? 0)) {
            return;
        }

        if (this.worldData[gridX]?.[gridY]) {
            this.worldData[gridX][gridY] = BlockType.EMPTY;
            const tile = this.worldTiles[gridX]?.[gridY];
            if (tile && this.collisionGroup) {
                this.collisionGroup.remove(tile, true, true);
                this.worldTiles[gridX][gridY] = null;
            }
        }
    }

    public addBlock(gridX: number, gridY: number, type: BlockType, force: boolean = false): boolean {
        if (gridX < 0 || gridX >= BALANCE_CONSTANTS.WORLD_WIDTH_IN_BLOCKS || 
            gridY < 0 || gridY >= BALANCE_CONSTANTS.WORLD_HEIGHT_IN_BLOCKS ||
            !this.worldData[gridX]) {
            return false;
        }

        if (this.worldData[gridX][gridY] === BlockType.EMPTY || force) {
            this.worldData[gridX][gridY] = type;
            if (this.collisionGroup) {
                this.createBlock(gridX, gridY, type);
            }
            return true;
        }
        return false;
    }
}
