import React, { useState, useEffect } from "react";
import { SketchPicker } from 'react-color';
import axios from 'axios';

function CardOverlay({
  task,
  onClose,
  currentColumn,
  updateTaskDescription,
  taskDescription,
}) {

  // TODO: Add priorities and dates to card overlay
  
  // State to manage task description and labels
  const [description, setDescription] = useState(taskDescription || "");
  const [newLabel, setNewLabel] = useState("");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [labels, setLabels] = useState([]);
  const [isLabelInputVisible, setIsLabelInputVisible] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [tasks, setTasks] = useState({}); // New state for tasks fetched

  useEffect(() => {
    const fetchData = async () => {
      const data = await axios.get('/api/kanban/get-kanban-board');
      setTasks(data.tasks);
    };

    fetchData();
  }, []);

  // Function to handle description change
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Function to save task description
  const handleSaveDescription = () => {
    updateTaskDescription(task.id, description);
  };

  // Function to cancel editing description
  const handleCancelEdit = () => {
    setDescription(taskDescription || "");
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

  // Function to create a new label
  const createNewLabel = () => {
    if (newLabel) {
      setLabels([...labels, { text: newLabel, color: labelColor }]);
    }
    toggleLabelInput();
  };

  return (
    <div className="card-overlay">
      <div className="overlay-content">
        <div className="task-details">
          <h4 className="task-name">{task.content}</h4>
          {currentColumn && (
            <p className="task-in-column">in column: {currentColumn.title}</p>
          )}
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
                  <img src={require('./pick-color.png')} alt="Edit" style={{ width: '18px', height: '18px' }} />
                </button>
                <button onClick={createNewLabel} className="create-label-btn">
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
              <button className="add-labels-btn" onClick={toggleLabelInput}>
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
            <button
              className="save-description-btn"
              onClick={handleSaveDescription}
            >
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
      </div>
    </div>
  );
}

export default CardOverlay;
