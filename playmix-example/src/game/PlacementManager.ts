
import * as Phaser from 'phaser';
import { Controls } from './Controls';
import { WorldManager } from './WorldManager';
import { InventoryManager } from '../objects/InventoryManager';
import { Player } from '../objects/Player';
import { VISUAL_CONSTANTS } from '../config/VisualConstants';
import { BALANCE_CONSTANTS } from '../config/BalanceConstants';
import { BlockType } from '../types/main';

export class PlacementManager {
    private scene: Phaser.Scene;
    private controls: Controls;
    private worldManager: WorldManager;
    private inventoryManager: InventoryManager;
    private player: Player;
    private placementPreview: Phaser.GameObjects.Rectangle;
    private lastPlacementTime: number = 0;

    constructor(scene: Phaser.Scene, controls: Controls, worldManager: WorldManager, inventoryManager: InventoryManager, player: Player) {
        this.scene = scene;
        this.controls = controls;
        this.worldManager = worldManager;
        this.inventoryManager = inventoryManager;
        this.player = player;

        this.placementPreview = scene.add.rectangle(0, 0, VISUAL_CONSTANTS.BLOCK_SIZE, VISUAL_CONSTANTS.BLOCK_SIZE, 0x00ff00, 0.5);
        this.placementPreview.setStrokeStyle(2, 0xffffff);
        this.placementPreview.setVisible(false);
    }

    update(time: number, delta: number): void {
        const selectedItem = this.inventoryManager.getSelectedItem();
        if (!selectedItem.item || selectedItem.quantity === 0) {
            this.placementPreview.setVisible(false);
            return;
        }

        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);
        if (distance > BALANCE_CONSTANTS.MAX_REACH_IN_BLOCKS * VISUAL_CONSTANTS.BLOCK_SIZE) {
            this.placementPreview.setVisible(false);
            return;
        }

        const { BLOCK_SIZE } = VISUAL_CONSTANTS;
        const gridX = Math.floor(worldPoint.x / BLOCK_SIZE);
        const gridY = Math.floor(worldPoint.y / BLOCK_SIZE);
        
        this.placementPreview.setPosition(gridX * BLOCK_SIZE + BLOCK_SIZE / 2, gridY * BLOCK_SIZE + BLOCK_SIZE / 2);
        this.placementPreview.setVisible(true);

        const isValid = this.checkPlacementValidity(gridX, gridY);
        const color = isValid ? VISUAL_CONSTANTS.PLACEMENT_PREVIEW_VALID_COLOR : VISUAL_CONSTANTS.PLACEMENT_PREVIEW_INVALID_COLOR;
        this.placementPreview.setFillStyle(color, 0.5);

        if (this.controls.isPlacing() && isValid && time > this.lastPlacementTime + 200) {
            if (this.inventoryManager.useSelectedItem()) {
                if(selectedItem.item) {
                    this.worldManager.addBlock(gridX, gridY, selectedItem.item);
                    this.lastPlacementTime = time;
                }
            }
        }
    }

    private checkPlacementValidity(gridX: number, gridY: number): boolean {
        const block = this.worldManager.getBlockAtGrid(gridX, gridY);
        if (block !== BlockType.EMPTY) {
            return false;
        }

        const playerBounds = this.player.getBounds();
        const blockBounds = new Phaser.Geom.Rectangle(
            gridX * VISUAL_CONSTANTS.BLOCK_SIZE,
            gridY * VISUAL_CONSTANTS.BLOCK_SIZE,
            VISUAL_CONSTANTS.BLOCK_SIZE,
            VISUAL_CONSTANTS.BLOCK_SIZE
        );
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, blockBounds)) {
            return false;
        }
        
        const neighbors = [
            this.worldManager.getBlockAtGrid(gridX + 1, gridY),
            this.worldManager.getBlockAtGrid(gridX - 1, gridY),
            this.worldManager.getBlockAtGrid(gridX, gridY + 1),
            this.worldManager.getBlockAtGrid(gridX, gridY - 1),
        ];

        if (neighbors.every(n => n === BlockType.EMPTY || n === null)) {
            return false;
        }

        return true;
    }
}
