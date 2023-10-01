import React, { useState } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";

function LabelOverlay({ onClose, createNewLabel }) {
  const [newLabel, setNewLabel] = useState("");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  // Function to toggle color picker visibility
  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  // Function to handle creating a new label
  const handleCreateLabel = async () => {
    // Check if the newLabel is empty or contains only whitespace
    if (!newLabel.trim()) {
      console.error("Label text is required.");
      return;
    }

    try {
      // Create a new label object using the text and color
      const newLabelObject = { text: newLabel.trim(), color: labelColor };

      // Create the label and pass it to the parent component
      createNewLabel(newLabelObject);
    } catch (error) {
      console.error("Failed to create label:", error);
    }
  };

  return (
    <div className="label-overlay">
      <div className="label-overlay-content">
        <h5 className="overlay-header">Create Label</h5>
        <div className="label-input-container">
          <input
            type="text"
            placeholder="Enter label text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="create-label-input"
          />
          <button className="change-color-btn" onClick={toggleColorPicker}>
            Pick Color
          </button>
          <div className="color-picker-container">
            {isColorPickerVisible && (
              <div className="color-picker-popover">
                <SketchPicker
                  color={labelColor}
                  onChange={(color) => setLabelColor(color.hex)}
                  disableAlpha={true}
                  presetColors={[]}
                />
              </div>
            )}
          </div>
          <button onClick={handleCreateLabel} className="create-label-btn">
            Create Label
          </button>
        </div>
        <button onClick={onClose} className="close-button-overlay">
          X
        </button>
      </div>
    </div>
  );
}

export default LabelOverlay;
