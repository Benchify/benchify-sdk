
import * as Phaser from 'phaser';

export class Controls {
    private scene: Phaser.Scene;
    private keys: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        jump: Phaser.Input.Keyboard.Key;
        numKeys: Phaser.Input.Keyboard.Key[];
    };
    private isMiningDown: boolean = false;
    private isPlacingDown: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        const { W, S, A, D, SPACE } = Phaser.Input.Keyboard.KeyCodes;
        this.keys = {
            up: scene.input.keyboard!.addKey(W),
            down: scene.input.keyboard!.addKey(S),
            left: scene.input.keyboard!.addKey(A),
            right: scene.input.keyboard!.addKey(D),
            jump: scene.input.keyboard!.addKey(SPACE),
            numKeys: []
        };
        
        for (let i = 1; i <= 9; i++) {
            this.keys.numKeys.push(scene.input.keyboard!.addKey(String(i)));
        }

        scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.isMiningDown = true;
            }
            if (pointer.rightButtonDown()) {
                this.isPlacingDown = true;
            }
        });

        scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            // Check which button was released
            if (pointer.button === 0) { // Left button
                 this.isMiningDown = false;
            }
            if (pointer.button === 2) { // Right button
                this.isPlacingDown = false;
            }
        });
    }

    public getHorizontalAxis(): number {
        if (this.keys.left.isDown) return -1;
        if (this.keys.right.isDown) return 1;
        return 0;
    }

    public isJumpJustDown(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.keys.jump);
    }

    public isMining(): boolean {
        return this.isMiningDown;
    }

    public isPlacing(): boolean {
        return this.isPlacingDown;
    }
    
    public getNumberKeyPressed(): number | null {
        for (let i = 0; i < 9; i++) {
            const key = this.keys.numKeys[i];
            if (key && Phaser.Input.Keyboard.JustDown(key)) {
                return i + 1;
            }
        }
        return null;
    }
}
