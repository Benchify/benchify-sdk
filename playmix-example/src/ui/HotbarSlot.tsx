
import React from "react";
import { InventorySlot } from "../types/main";
import { VISUAL_CONSTANTS } from '../config/VisualConstants';
import { BLOCK_DATA } from '../config/BlockData';

interface HotbarSlotProps {
    slotData: InventorySlot;
    isSelected: boolean;
    slotNumber: number;
}

const HotbarSlot: React.FC<HotbarSlotProps> = ({ slotData, isSelected, slotNumber }) => {
    
    const blockColor = slotData.item !== null ? '#' + VISUAL_CONSTANTS.BLOCK_COLORS[slotData.item].toString(16).padStart(6, '0') : 'transparent';
    const blockName = slotData.item !== null ? BLOCK_DATA[slotData.item].name : '';

    return (
        <div
            style={{
                width: "54px",
                height: "54px",
                backgroundColor: "rgba(100,100,100,0.5)",
                border: isSelected ? "3px solid white" : "3px solid #555",
                borderRadius: "4px",
                position: "relative",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
            }}
            title={blockName}
        >
            {slotData.item !== null && (
                <>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: blockColor,
                        borderRadius: '4px',
                        border: '1px solid rgba(0,0,0,0.2)'
                    }}></div>
                    <span style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px black',
                    }}>
                        {slotData.quantity > 0 ? slotData.quantity : ''}
                    </span>
                </>
            )}
            <span style={{
                position: 'absolute',
                top: '2px',
                left: '4px',
                fontSize: '12px',
                color: '#ccc',
                textShadow: '1px 1px 2px black',
            }}>
                {slotNumber}
            </span>
        </div>
    );
};

export default HotbarSlot;
