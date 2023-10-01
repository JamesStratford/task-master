import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";
import LabelOverlay from "./LabelOverlay";

function CardOverlay({ task, onClose, updateTaskContents }) {
  // State to manage task description and labels
  const [description, setDescription] = useState(task.description || "");
  const [newLabel, setNewLabel] = useState(false);
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [labels, setLabels] = useState(task.labels || []);
  const [isLabelInputVisible, setIsLabelInputVisible] = useState(false);
  const [isLabelOverlayVisible, setIsLabelOverlayVisible] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  // Function to handle description change
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Function to save task description and labels
  const handleUpdateTask = () => {
    const updatedTask = {
      ...task, // Keep the existing task data
      description: description, // Update the description
      labels: labels, // Update the labels
    };
    updateTaskContents(updatedTask);
  };

  // Function to cancel editing description
  const handleCancelEdit = () => {
    setDescription(task.description || "");
  };

  // Function to toggle label input visibility
  const toggleLabelInput = () => {
    setIsLabelInputVisible(!isLabelInputVisible);
    setNewLabel("");
  };

  // Function to toggle color picker visibility
  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const toggleLabelOverlay = () => {
    setIsLabelOverlayVisible(!isLabelOverlayVisible);
  };

  // Function to create a new label
  /*const createNewLabel = async () => {
    // Check if the newLabel is empty or contains only whitespace
    if (!newLabel.trim()) {
      console.error("Label text is required."); 
      return;
    }

    console.log(
      "Making API request to:",
      `${process.env.REACT_APP_BACKEND_URL}/api/kanban/save-label`
    );

    try {
      // Create a new label object using the text from the input field and the selected color
      const newLabelObject = { text: newLabel.trim(), color: labelColor };

      // Update the task in the local state
      setLabels([...labels, newLabelObject]);

      // Update the task in the database
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/save-label`,
        {
          label: newLabelObject,
        }
      );

      // If successful, log a success message
      console.log("Label successfully created:", newLabelObject);
    } catch (error) {
      console.error("Failed to create label:", error);

      // Log the response data if available
      if (error.response) {
        console.error("Response Data:", error.response.data);
      }
    }
    toggleLabelInput();
  };*/

  return (
    <div className="card-overlay">
      <div className="overlay-content">
        <div className="task-details">
          <h4 className="task-name">{task.content}</h4>
        </div>
        <div className="labels">
          <h5 className="labels-header">
            Labels
            {isLabelInputVisible ? (
              <div className="label-input-container">
                <input
                  type="text"
                  placeholder="Enter label text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="create-label-input"
                />
                <button
                  className="change-color-btn"
                  onClick={toggleColorPicker}
                >
                  <img
                    src={require("./pick-color.png")}
                    alt="Edit"
                    style={{ width: "18px", height: "18px" }}
                  />
                </button>
                {/* Update the onClick handler to toggleLabelOverlay */}
                <button
                  onClick={toggleLabelOverlay}
                  className="create-label-btn"
                >
                  Create Label
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
              </div>
            ) : (
              /* Update the onClick handler to toggleLabelOverlay */
              <button className="add-labels-btn" onClick={toggleLabelOverlay}>
                +
              </button>
            )}
          </h5>
          <div className="labels-list">
            {labels.map((label, index) => (
              <span
                key={index}
                className="label-text"
                style={{ backgroundColor: label.color }}
              >
                {label.text}
              </span>
            ))}
          </div>
        </div>
        <div className="description">
          <h5 className="description-header">Description</h5>
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            className="description-input"
          />
          <div className="input-button-container">
            <button className="save-description-btn" onClick={handleUpdateTask}>
              Save
            </button>
            <button 
              className="cancel-description-btn"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
        <button onClick={onClose} className="close-button-overlay">
          <img src={require("./close.png")} alt="Close" />
        </button>
        {isLabelOverlayVisible && (
          <LabelOverlay
            // Pass any props that the LabelOverlay component needs
            // For example, you can pass a function to create a new label
            onClose={onClose} // Example prop
            labelColor={labelColor}
            setLabelColor={setLabelColor}
            setNewLabel={setNewLabel}
          />
        )}
      </div>
    </div>
    
  );
}

export default CardOverlay;
