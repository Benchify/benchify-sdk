
import React from "react";

const ControlsDisplay: React.FC = () => {
    return (
        <div
            style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#eee",
            }}
        >
            WASD &amp; Space: Move | Left-Click: Mine | Right-Click: Build | 1-9: Select Item
        </div>
    );
};

export default ControlsDisplay;
