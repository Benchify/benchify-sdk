
import * as Phaser from 'phaser';
import { Controls } from './Controls';
import { WorldManager } from './WorldManager';
import { InventoryManager } from '../objects/InventoryManager';
import { Player } from '../objects/Player';
import { VISUAL_CONSTANTS } from '../config/VisualConstants';
import { BALANCE_CONSTANTS } from '../config/BalanceConstants';
import { BLOCK_DATA } from '../config/BlockData';
import { BlockType } from '../types/main';

export class MiningManager {
    private scene: Phaser.Scene;
    private controls: Controls;
    private worldManager: WorldManager;
    private inventoryManager: InventoryManager;
    private player: Player;

    private miningTarget: { x: number, y: number } | null = null;
    private miningProgress: number = 0;
    private miningTime: number = 0;
    private crackGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, controls: Controls, worldManager: WorldManager, inventoryManager: InventoryManager, player: Player) {
        this.scene = scene;
        this.controls = controls;
        this.worldManager = worldManager;
        this.inventoryManager = inventoryManager;
        this.player = player;
        this.crackGraphics = scene.add.graphics();
    }

    update(time: number, delta: number): void {
        this.crackGraphics.clear();
        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

        const gridX = Math.floor(worldPoint.x / VISUAL_CONSTANTS.BLOCK_SIZE);
        const gridY = Math.floor(worldPoint.y / VISUAL_CONSTANTS.BLOCK_SIZE);
        
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);
        if (distance > BALANCE_CONSTANTS.MAX_REACH_IN_BLOCKS * VISUAL_CONSTANTS.BLOCK_SIZE) {
            this.resetMining();
            return;
        }

        if (this.controls.isMining()) {
            const blockType = this.worldManager.getBlockAtGrid(gridX, gridY);
            if (blockType && blockType !== BlockType.EMPTY) {
                const blockInfo = BLOCK_DATA[blockType];
                if (blockInfo.hardness === Infinity) {
                    this.resetMining();
                    return;
                }
                
                if (this.miningTarget?.x === gridX && this.miningTarget?.y === gridY) {
                    this.miningProgress += delta;
                } else {
                    this.miningTarget = { x: gridX, y: gridY };
                    this.miningProgress = 0;
                    this.miningTime = BALANCE_CONSTANTS.MINING_BASE_DURATION_MS * blockInfo.hardness;
                }

                if (this.miningProgress >= this.miningTime) {
                    this.worldManager.removeBlock(gridX, gridY);
                    if (blockInfo.drop !== null) {
                        this.inventoryManager.addItem(blockInfo.drop);
                    }
                    this.resetMining();
                } else {
                    this.drawCracks();
                }
            } else {
                this.resetMining();
            }
        } else {
            this.resetMining();
        }
    }

    private resetMining(): void {
        this.miningTarget = null;
        this.miningProgress = 0;
    }

    private drawCracks(): void {
        if (!this.miningTarget) return;

        const progress = this.miningProgress / this.miningTime;
        const crackCount = Math.floor(progress * 10);
        if (crackCount === 0) return;
        
        const { BLOCK_SIZE } = VISUAL_CONSTANTS;
        const x = this.miningTarget.x * BLOCK_SIZE;
        const y = this.miningTarget.y * BLOCK_SIZE;

        this.crackGraphics.lineStyle(2, VISUAL_CONSTANTS.MINING_CRACK_COLOR, 0.5);
        const rand = new Phaser.Math.RandomDataGenerator([`${this.miningTarget.x},${this.miningTarget.y}`]);

        for (let i = 0; i < crackCount; i++) {
            const startX = x + rand.integerInRange(0, BLOCK_SIZE);
            const startY = y + rand.integerInRange(0, BLOCK_SIZE);
            const endX = startX + rand.integerInRange(-5, 5);
            const endY = startY + rand.integerInRange(-5, 5);
            this.crackGraphics.lineBetween(startX, startY, endX, endY);
        }
    }
}
