import React, { useState } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";

function LabelOverlay({ onClose, createNewLabel }) {
  const [newLabel, setNewLabel] = useState("");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Function to toggle color picker visibility
  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  // Function to handle creating a new label
  const handleCreateLabel = async () => {
    if (!newLabel.trim()) {
      console.error("Label text is required.");
      return;
    }

    try {
      const newLabelObject = { text: newLabel.trim(), color: labelColor };
      createNewLabel(newLabelObject);
    } catch (error) {
      console.error("Failed to create label:", error);
    }
  };

  // Function to close the LabelOverlay
  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  // New method to close only the LabelOverlay
  const closeLabelOverlay = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

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
        <button onClick={closeLabelOverlay} className="close-button-overlay">
          X
        </button>
      </div>
    </div>
  );
}

export default LabelOverlay;
