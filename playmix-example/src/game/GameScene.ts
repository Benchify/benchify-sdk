
import * as Phaser from 'phaser';
import { VISUAL_CONSTANTS } from '../config/VisualConstants';
import { BALANCE_CONSTANTS } from '../config/BalanceConstants';
import { Player } from '../objects/Player';
import { Controls } from './Controls';
import { WorldManager } from './WorldManager';
import { InventoryManager } from '../objects/InventoryManager';
import { MiningManager } from './MiningManager';
import { PlacementManager } from './PlacementManager';

export class GameScene extends Phaser.Scene {
    private player?: Player;
    private controls?: Controls;
    private worldManager?: WorldManager;
    private inventoryManager?: InventoryManager;
    private miningManager?: MiningManager;
    private placementManager?: PlacementManager;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload(): void {
        // No assets to load, using primitives
    }

    create(): void {
        // Background Gradient
        const worldPixelWidth = BALANCE_CONSTANTS.WORLD_WIDTH_IN_BLOCKS * VISUAL_CONSTANTS.BLOCK_SIZE;
        const worldPixelHeight = BALANCE_CONSTANTS.WORLD_HEIGHT_IN_BLOCKS * VISUAL_CONSTANTS.BLOCK_SIZE;
        const bg = this.add.graphics({ x: 0, y: 0 });
        bg.fillGradientStyle(VISUAL_CONSTANTS.SKY_COLOR_TOP, VISUAL_CONSTANTS.SKY_COLOR_TOP, VISUAL_CONSTANTS.SKY_COLOR_BOTTOM, VISUAL_CONSTANTS.SKY_COLOR_BOTTOM, 1);
        bg.fillRect(0, 0, worldPixelWidth, worldPixelHeight);
        
        this.controls = new Controls(this);
        this.inventoryManager = new InventoryManager(this);

        this.worldManager = new WorldManager(this);
        const { spawnX, spawnY } = this.worldManager.generateWorld();

        this.player = new Player(this, spawnX, spawnY);
        
        this.miningManager = new MiningManager(this, this.controls, this.worldManager, this.inventoryManager, this.player);
        this.placementManager = new PlacementManager(this, this.controls, this.worldManager, this.inventoryManager, this.player);

        // Physics
        if (this.player && this.worldManager) {
            this.physics.add.collider(this.player, this.worldManager.collisionGroup);
        }

        // Camera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, worldPixelWidth, worldPixelHeight);
        this.physics.world.setBounds(0, 0, worldPixelWidth, worldPixelHeight);
        
        this.input.mouse?.disableContextMenu();
    }

    update(time: number, delta: number): void {
        if (!this.controls || !this.player || !this.miningManager || !this.placementManager || !this.inventoryManager) {
            return;
        }
        
        this.player.update(this.controls);
        this.miningManager.update(time, delta);
        this.placementManager.update(time, delta);

        const numKey = this.controls.getNumberKeyPressed();
        if (numKey !== null) {
            this.inventoryManager.changeSelectedSlot(numKey - 1);
        }
    }
}
