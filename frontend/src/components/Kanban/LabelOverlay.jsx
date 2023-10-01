import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";

function LabelOverlay({ labels, setLabels, toggleLabelInput, onClose }) {
  const [newLabel, setNewLabel] = useState("");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [allLabels, setAllLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    const fetchAllLabels = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-all-labels`
        );
        setAllLabels(response.data);
      } catch (error) {
        console.error("Failed to fetch labels:", error);
      }
    };

    fetchAllLabels();
  }, []);

  const createNewLabel = async () => {
    if (!newLabel.trim() || !labelColor) {
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

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const handleAddLabelToCard = () => {
    if (selectedLabel) {
      const labelToAdd = allLabels.find((label) => label.text === selectedLabel);

      if (labelToAdd) {
        const isLabelAlreadyAssigned = labels.some(
          (label) => label.text === labelToAdd.text
        );

        if (!isLabelAlreadyAssigned) {
          setLabels([...labels, labelToAdd]);
        } else {
          console.error("Label is already assigned to the card.");
        }
      }
    }
    closeLabelOverlay();
  };

  const closeLabelOverlay = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  // Filter labels to exclude those already assigned to the card
  const filteredLabels = allLabels.filter((label) => {
    return !labels.some((cardLabel) => cardLabel.text === label.text);
  });

  return (
    <div className="label-overlay">
      <div className="label-overlay-content">
        <div className="label-dropdown-container">
          <select
            className="label-dropdown"
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
          >
            <option value="">Select a Label</option>
            {filteredLabels.map((label) => (
              <option
                key={label.id}
                value={label.text}
                style={{ backgroundColor: label.color }}
              >
                {label.text}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddLabelToCard}
            className="add-label-button"
          >
            +
          </button>
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
