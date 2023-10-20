import React, { useState } from "react";
import LabelOverlay from "./LabelOverlay";
import './Checklist.css';
import ChecklistComponent from './ChecklistComponent.jsx';

function CardOverlay({
  task,
  onClose,
  updateTaskContents,
  allLabels,
  setAllLabels,
  // fetchAllLabels,
}) {
  const [description, setDescription] = useState(task.description || "");
  const [labelColor, setLabelColor] = useState("#ffffff");
  const [cardLabels, setCardLabels] = useState(task.labels || []);
  const [isLabelOverlayVisible, setIsLabelOverlayVisible] = useState(false);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleCancelEdit = () => {
    setDescription(task.description || "");
  };

  const toggleLabelOverlay = () => {
    setIsLabelOverlayVisible(!isLabelOverlayVisible);
  };

  const handleUpdateTask = () => {
    const updatedTask = {
      ...task,
      description: description,
      labels: cardLabels,
    };

    const isNewLabel = !allLabels.some((label) =>
      cardLabels.some((l) => l.text === label.text)
    );

    if (isNewLabel) {
      setAllLabels([...allLabels, ...cardLabels]);
    }

    updateTaskContents(updatedTask);
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
        
        <div className="labels-list" style={{ display: "flex", flexWrap: "wrap" }}>
          {cardLabels.map((label, index) => (
            <span key={index} className="label-text" style={{ backgroundColor: label.color }}>
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
            <button className="cancel-description-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>

        
        <ChecklistComponent
          taskId={task.taskId}
          initialChecklist={task.checklist}
        />

        <button onClick={onClose} className="close-button-overlay">
          <img src={require("./close.png")} alt="Close" />
        </button>

        {isLabelOverlayVisible && (
          <LabelOverlay
            task={task}
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
