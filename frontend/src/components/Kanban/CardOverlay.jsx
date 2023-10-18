import React, { useState, useEffect } from "react";
import LabelOverlay from "./LabelOverlay";
import axios from "axios";
import './Checklist.css';
import checklistIcon from './checklist.png';


function CardOverlay({
  task,
  onClose,
  updateTaskContents,
  allLabels,
  setAllLabels,
  // fetchAllLabels,
}) {
  const [description, setDescription] = useState(task.description || ""); // Manage the description state
  const [labelColor, setLabelColor] = useState("#ffffff"); // Manage the label color state
  const [cardLabels, setCardLabels] = useState(task.labels || []); // Manage the labels state
  const [isLabelOverlayVisible, setIsLabelOverlayVisible] = useState(false); // Manage the label overlay visibility state
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  /* Function to handle description change */
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  /* Function to cancel editing description */
  const handleCancelEdit = () => {
    setDescription(task.description || "");
  };

  /* Function to toggle the label overlay */
  const toggleLabelOverlay = () => {
    setIsLabelOverlayVisible(!isLabelOverlayVisible);
  };

  /* *
   * Function to handle the updating of task contents.
   * */
  const handleUpdateTask = () => {
    // Data for the updated task
    const updatedTask = {
      ...task,
      description: description,
      labels: cardLabels,
    };

    // Check if the edited label is new (not in allLabels)
    const isNewLabel = !allLabels.some((label) =>
      cardLabels.some((l) => l.text === label.text)
    );

    // If it's a new label, add it to allLabels
    if (isNewLabel) {
      setAllLabels([...allLabels, ...cardLabels]);
    }

    updateTaskContents(updatedTask); // Update this tasks contents
  };

  const handleAddItem = async () => {
    if (newChecklistItem.trim()) {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/add-checklist-item`, {
                taskId: task.taskId,
                checklistItem: {
                    description: newChecklistItem,
                    isCompleted: false
                }
            });
            
            if(response.status === 200) {
                setChecklist((prev) => [...prev, { description: newChecklistItem, isCompleted: false }]);
                setNewChecklistItem("");
            }
        } catch(error) {
            console.error("Error adding checklist item:", error);
        }
    }
};

const handleCheckItem = async (index) => {
  const currentItem = checklist[index];
  const updatedStatus = !currentItem.isCompleted; // Toggle status

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-checklist-item-status`,
      {
        taskId: task.taskId,
        checklistItemId: currentItem._id,
        isCompleted: updatedStatus
      }
    );

    if(response.status === 200) {
      // Update the local state with the new completion status
      setChecklist(prevChecklist => prevChecklist.map((item, idx) => {
        if (idx === index) {
          return { ...item, isCompleted: updatedStatus };
        }
        return item;
      }));
    }
  } catch(error) {
    console.error("Error updating checklist item status:", error);
  }
};


  const handleNewItemChange = (e) => {
    setNewChecklistItem(e.target.value);
  };


  const handleDeleteItem = async (index) => {
    const currentItem = checklist[index];
    try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/delete-checklist-item`, {
            taskId: task.taskId,
            checklistItemId: currentItem._id
        });

        if(response.status === 200) {
            setChecklist(prev => prev.filter((_, idx) => idx !== index));
        }
    } catch(error) {
        console.error("Error deleting checklist item:", error);
    }
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
      <div
        className="labels-list"
        style={{ display: "flex", flexWrap: "wrap" }}
      >
        {cardLabels.map((label, index) => (
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

      <div className="checklist">
        <h5 className="checklist-header"><img src={checklistIcon} alt="Checklist Icon" className="checklist-icon" /> 
        Checklist</h5>
        <ul className="checklist-items">
          {checklist.map((item, index) => (
            <li key={index} className="checklist-item">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  className="checklist-item-checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleCheckItem(index)}
                />
                <span className={item.isCompleted ? "checklist-item-text completed" : "checklist-item-text"}>
                  {item.description}
                </span>
              </div>
              <button className="delete-checklist-item-btn" onClick={() => handleDeleteItem(index)}>Delete</button>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            className="new-checklist-item-input"
            value={newChecklistItem}
            onChange={handleNewItemChange}
            placeholder="Add new item"
          />
          <button className="add-checklist-item-btn" onClick={handleAddItem}>Add</button>
        </div>
      </div>
      
      <button onClick={onClose} className="close-button-overlay">
        <img src={require("./close.png")} alt="Close" />
      </button>
      {isLabelOverlayVisible && (
        <LabelOverlay
          task={task} // The current task
          cardLabels={cardLabels}
          setCardLabels={setCardLabels}
          allLabels={allLabels}
          setAllLabels={setAllLabels}
          labelColor={labelColor}
          setLabelColor={setLabelColor}
          toggleLabelOverlay={toggleLabelOverlay}
          handleUpdateTask={handleUpdateTask}
          updateTaskContents={updateTaskContents}
        />
      )}
    </div>
  </div>
);

}

export default CardOverlay;
