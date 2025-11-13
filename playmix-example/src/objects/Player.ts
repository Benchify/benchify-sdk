
import * as Phaser from 'phaser';
import { Controls } from '../game/Controls';
import { VISUAL_CONSTANTS } from '../config/VisualConstants';
import { BALANCE_CONSTANTS } from '../config/BalanceConstants';

export class Player extends Phaser.GameObjects.Container {
    public body!: Phaser.Physics.Arcade.Body;
    private bodySprite: Phaser.GameObjects.Rectangle;
    private headSprite: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.bodySprite = scene.add.rectangle(0, 0, VISUAL_CONSTANTS.PLAYER_WIDTH, VISUAL_CONSTANTS.PLAYER_HEIGHT, 0x0077ff);
        this.headSprite = scene.add.rectangle(0, -VISUAL_CONSTANTS.PLAYER_HEIGHT / 2 + VISUAL_CONSTANTS.PLAYER_WIDTH / 2, VISUAL_CONSTANTS.PLAYER_WIDTH, VISUAL_CONSTANTS.PLAYER_WIDTH, 0xffddbb);
        
        this.add([this.bodySprite, this.headSprite]);

        this.body.setSize(VISUAL_CONSTANTS.PLAYER_WIDTH, VISUAL_CONSTANTS.PLAYER_HEIGHT);
        this.body.setCollideWorldBounds(true);
        this.body.setOffset(-VISUAL_CONSTANTS.PLAYER_WIDTH/2, -VISUAL_CONSTANTS.PLAYER_HEIGHT/2);
    }

    public update(controls: Controls): void {
        if (!this.active) { return; }

        const horizontalInput = controls.getHorizontalAxis();
        if (this.body) {
            this.body.setVelocityX(horizontalInput * BALANCE_CONSTANTS.PLAYER_SPEED);
        }

        if (horizontalInput < 0 && this.scaleX > 0) {
            this.scaleX = -1;
        } else if (horizontalInput > 0 && this.scaleX < 0) {
            this.scaleX = 1;
        }

        if (controls.isJumpJustDown() && this.body?.blocked.down) {
            this.body.setVelocityY(-BALANCE_CONSTANTS.PLAYER_JUMP_VELOCITY);
        }
    }
}
