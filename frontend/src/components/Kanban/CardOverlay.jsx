import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";
import LabelOverlay from "./LabelOverlay";

function CardOverlay({ task, onClose, updateTaskContents }) {
  // State to manage task description and labels
  const [description, setDescription] = useState(task.description || "");
  const [newLabel, setNewLabel] = useState(false);
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [labels, setLabels] = useState(task.labels || []); // Ensure labels is always an array
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

  const toggleLabelOverlay = () => {
    setIsLabelOverlayVisible(!isLabelOverlayVisible);
  };

  return (
    <div className="card-overlay">
      <div className="overlay-content">
        <div className="task-details">
          <h4 className="task-name">{task.content}</h4>
        </div>
        <div className="labels">
          <h5 className="labels-header">
            Labels
              <button className="add-labels-btn" onClick={toggleLabelOverlay}>
                +
              </button>
          </h5>
        </div>
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
            onClose={onClose}
            labelColor={labelColor}
            setLabelColor={setLabelColor}
            setNewLabel={setNewLabel}
            labels={labels} // Pass the labels array to LabelOverlay
            setLabels={setLabels} // Pass the setLabels function to LabelOverlay
            toggleLabelInput={toggleLabelInput} // Pass the toggleLabelInput function to LabelOverlay
          />
        )}
      </div>
    </div>
  );
}

export default CardOverlay;
