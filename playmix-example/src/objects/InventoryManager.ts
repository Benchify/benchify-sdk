
import * as Phaser from 'phaser';
import { BlockType, InventorySlot } from '../types/main';

export class InventoryManager {
    private scene: Phaser.Scene;
    private hotbar: InventorySlot[] = [];
    private selectedSlotIndex: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        for (let i = 0; i < 9; i++) {
            this.hotbar.push({ item: null, quantity: 0 });
        }
        
        this.hotbar[1] = { item: BlockType.DIRT, quantity: 64 };
        this.hotbar[2] = { item: BlockType.STONE, quantity: 64 };
        this.hotbar[3] = { item: BlockType.WOOD, quantity: 64 };

        this.emitInventoryUpdate();
        this.emitSelectedSlotUpdate();
    }

    private emitInventoryUpdate(): void {
        this.scene.game.events.emit('inventoryUpdate', this.hotbar);
    }
    
    private emitSelectedSlotUpdate(): void {
        this.scene.game.events.emit('selectedSlotUpdate', this.selectedSlotIndex);
    }

    public addItem(itemType: BlockType, quantity: number = 1): void {
        for (const slot of this.hotbar) {
            if (slot.item === itemType && slot.quantity < 64) {
                slot.quantity += quantity;
                this.emitInventoryUpdate();
                return;
            }
        }

        for (const slot of this.hotbar) {
            if (slot.item === null) {
                slot.item = itemType;
                slot.quantity = quantity;
                this.emitInventoryUpdate();
                return;
            }
        }
    }

    public useSelectedItem(): boolean {
        const selectedSlot = this.hotbar[this.selectedSlotIndex];
        if (selectedSlot?.item && selectedSlot.quantity > 0) {
            selectedSlot.quantity--;
            if (selectedSlot.quantity === 0) {
                selectedSlot.item = null;
            }
            this.emitInventoryUpdate();
            return true;
        }
        return false;
    }
    
    public getSelectedItem(): InventorySlot | null {
        const slot = this.hotbar[this.selectedSlotIndex];
        return slot ?? null;
    }

    public changeSelectedSlot(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex < 9) {
            this.selectedSlotIndex = slotIndex;
            this.emitSelectedSlotUpdate();
        }
    }
}
