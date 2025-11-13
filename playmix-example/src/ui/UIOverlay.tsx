
import React from "react";
import { InventorySlot } from "../types/main";
import Hotbar from "./Hotbar";
import ControlsDisplay from "./ControlsDisplay";

interface UIOverlayProps {
    inventoryData: InventorySlot[];
    selectedSlotIndex: number;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ inventoryData, selectedSlotIndex }) => {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "20px",
                boxSizing: "border-box",
                gap: "20px",
            }}
        >
            <Hotbar inventoryData={inventoryData} selectedSlotIndex={selectedSlotIndex} />
            <ControlsDisplay />
        </div>
    );
};

export default UIOverlay;
