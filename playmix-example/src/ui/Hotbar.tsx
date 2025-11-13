
import React from "react";
import { InventorySlot } from "../types/main";
import HotbarSlot from "./HotbarSlot";

interface HotbarProps {
    inventoryData: InventorySlot[];
    selectedSlotIndex: number;
}

const Hotbar: React.FC<HotbarProps> = ({ inventoryData, selectedSlotIndex }) => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                gap: "4px",
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: "4px",
                borderRadius: "4px",
            }}
        >
            {inventoryData.map((slot, index) => (
                <HotbarSlot 
                    key={index} 
                    slotData={slot} 
                    isSelected={index === selectedSlotIndex}
                    slotNumber={index + 1}
                />
            ))}
        </div>
    );
};

export default Hotbar;
