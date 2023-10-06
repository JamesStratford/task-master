import React, { useState } from "react";
import { SketchPicker } from "react-color";
import axios from "axios";

function CardOverlay({ task, onClose, updateTaskContents }) {
  // State to manage task description and labels
  const [description, setDescription] = useState(task.description || "");
  const [newLabel, setNewLabel] = useState(false);
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [labels, setLabels] = useState(task.labels || []);
  const [isLabelInputVisible, setIsLabelInputVisible] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

   // State to manage checklist
   const [checklist, setChecklist] = useState(task.checklist || []);
   const [newChecklistItem, setNewChecklistItem] = useState("");

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

  // Function to create a new label
  const createNewLabel = async () => {
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
  };

    // Function to handle new checklist item input change
    const handleChecklistItemChange = (e) => {
      setNewChecklistItem(e.target.value);
    };
  
    // Function to add a new checklist item
    const addChecklistItem = () => {
      if (!newChecklistItem.trim()) {
        console.error("Checklist item is required."); 
        return;
      }
  
      // Adding a new checklist item to state
      setChecklist([...checklist, { text: newChecklistItem, completed: false }]);
      
      // Clear the new checklist item input
      setNewChecklistItem("");
    };
  
    // Function to toggle checklist item completion status
    const toggleChecklistItemCompletion = (index) => {
      const updatedChecklist = [...checklist];
      updatedChecklist[index].completed = !updatedChecklist[index].completed;
      setChecklist(updatedChecklist);
    };

    const deleteChecklistItem = (index) => {
      // Create a new array excluding the item to be deleted
      const updatedChecklist = checklist.filter((_, i) => i !== index);
      
      // Update the state
      setChecklist(updatedChecklist);
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
          <div className="checklist">
            <h5 className="checklist-header">
              <img 
                src={require("./checklist.png")} 
                alt="Checklist Icon" 
                className="checklist-icon"
              />
              Checklist
            </h5>
            <input
                type="text"
                value={newChecklistItem}
                onChange={handleChecklistItemChange}
                placeholder="New checklist item"
                className="new-checklist-item-input"
            />
            <button onClick={addChecklistItem} className="add-checklist-item-btn">
                Add
            </button>
            <div className="checklist-items">
                {checklist.map((item, index) => (
                    <div key={index} className="checklist-item">
                        <input 
                            type="checkbox" 
                            checked={item.completed}
                            onChange={() => toggleChecklistItemCompletion(index)}
                            className="checklist-item-checkbox"
                        />
                        <span className={`checklist-item-text ${item.completed ? 'completed' : ''}`}>
                            {item.text}
                        </span>
                        <button onClick={() => deleteChecklistItem(index)} className="delete-checklist-item-btn">
                          X
                        </button>
                    </div>
                ))}
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
