import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";

function LabelOverlay({ labels, setLabels, toggleLabelInput, onClose }) {
  const [newLabel, setNewLabel] = useState("");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [allLabels, setAllLabels] = useState([]); // State to store all labels from the database

  useEffect(() => {
    // Fetch all labels from the database when the component mounts
    const fetchAllLabels = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-all-labels`
        );
        setAllLabels(response.data); // Set the fetched labels in state
      } catch (error) {
        console.error("Failed to fetch labels:", error);
      }
    };

    fetchAllLabels();
  }, []); // Empty dependency array to run this effect only once

  const createNewLabel = async () => {
    if (!newLabel.trim() || !labelColor) {
      // Label text and color are required.
      return;
    }

    try {
      const newLabelObject = {
        text: newLabel.trim(),
        color: labelColor,
        id: Date.now(),
      };

      setLabels([...labels, newLabelObject]);

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/save-label`,
        newLabelObject
      );
    } catch (error) {
      console.error("Failed to create label:", error);

      if (error.response) {
        console.error("Response Data:", error.response.data);
      }
    }

    toggleLabelInput();
    closeLabelOverlay();
  };
  
  // Function to toggle color picker visibility
  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
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
        <div className="label-dropdown-container">
          <select className="label-dropdown">
            <option value="">Select a Label</option>
            {allLabels.map((label) => (
              <option
                key={label.id}
                value={label.text}
                style={{ backgroundColor: label.color }}
              >
                {label.text}
              </option>
            ))}
          </select>
        </div>
        <h5 className="label-overlay-header">Create a label</h5>
        <div className="label-input-container">
          <input
            type="text"
            placeholder="Enter label text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="create-label-input"
          />
          <div className="create-label-container">
            <button className="change-color-btn" onClick={toggleColorPicker}>
              <img
                src={require("./pick-color.png")}
                alt="Pick Color"
                style={{ width: "20px", height: "20px" }}
              />
            </button>
            <button onClick={createNewLabel} className="create-label-btn">
              Create Label
            </button>
          </div>
        </div>
        <button onClick={closeLabelOverlay} className="close-button-overlay">
          X
        </button>
      </div>
      {isColorPickerVisible && (
        <div className="color-picker-overlay">
          <SketchPicker
            color={labelColor}
            onChange={(color) => setLabelColor(color.hex)}
            disableAlpha={true}
            presetColors={[]}
          />
        </div>
      )}
    </div>
  );
}

export default LabelOverlay;
