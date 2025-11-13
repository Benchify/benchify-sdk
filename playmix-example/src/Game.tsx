
import React, { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";
import { GameScene } from "./game/GameScene";
import UIOverlay from "./ui/UIOverlay";
import { BALANCE_CONSTANTS } from "./config/BalanceConstants";
import { InventorySlot } from "./types/main";

const Game: React.FC = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const phaserGameRef = useRef<Phaser.Game | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // UI State
    const [inventoryData, setInventoryData] = useState<InventorySlot[]>([]);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);

    useEffect(() => {
        if (!rootRef.current || phaserGameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: rootRef.current,
            scene: [GameScene],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            backgroundColor: "#000000",
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: BALANCE_CONSTANTS.GRAVITY },
                }
            },
        };

        const game = new Phaser.Game(config);
        phaserGameRef.current = game;

        // --- React-Phaser Bridge ---
        const handleInventoryUpdate = (data: InventorySlot[]) => {
            setInventoryData([...data]); // Create new array to trigger re-render
        };
        const handleSelectedSlotUpdate = (index: number) => {
            setSelectedSlotIndex(index);
        };

        game.events.on('inventoryUpdate', handleInventoryUpdate);
        game.events.on('selectedSlotUpdate', handleSelectedSlotUpdate);
        // ---------------------------

        game.events.on("ready", () => {
            setIsLoading(false);
        });

        const handleResize = () => {
            if (phaserGameRef.current) {
                phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            if (phaserGameRef.current) {
                game.events.off('inventoryUpdate', handleInventoryUpdate);
                game.events.off('selectedSlotUpdate', handleSelectedSlotUpdate);
                phaserGameRef.current.destroy(true);
                phaserGameRef.current = null;
            }
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                position: "relative",
                backgroundColor: "#000",
                overflow: "hidden",
            }}
        >
            <UIOverlay inventoryData={inventoryData} selectedSlotIndex={selectedSlotIndex} />
            <div
                ref={rootRef}
                style={{
                    width: "100%",
                    height: "100%",
                    margin: 0,
                    padding: 0,
                    backgroundColor: "#000",
                    overflow: "hidden",
                    touchAction: "none",
                    visibility: isLoading ? "hidden" : "visible",
                }}
            />
        </div>
    );
};

export default Game;
