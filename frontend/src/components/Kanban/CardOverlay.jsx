import React, { useState, useEffect } from 'react';
import initialData from './initialData';

function CardOverlay({
  task,
  onClose,
  currentColumn,
  updateTaskDescription,
  taskDescription,
}) {
  const [description, setDescription] = useState(taskDescription || '');

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSaveDescription = () => {
    updateTaskDescription(task.id, description);
    onClose();
  };

  const handleCancelEdit = () => {
    setDescription(taskDescription || '');
  }

  return (
    <div className="card-overlay">
      <div className="overlay-content">
        <div className="task-details">
          <h4 className="task-name">{task.content}</h4>
          {task.column && (
            <p className="task-in-column">in column: {currentColumn ? currentColumn.title : ''}</p>
          )}
        </div>
        <div className="labels">
          <h5 className="labels-header">
            Labels
            <button className="add-labels-btn">+</button>
          </h5>
        </div>
        <div className="description">
          <h5 className="description-header">
            Description
          </h5>
          <input
            type="text"
            className="description-input"
            value={description}
            onChange={handleDescriptionChange}
          />
          <div className="input-button-container">
            <button className="save-description-btn" onClick={handleSaveDescription}>
              Save
            </button>
            <button className="cancel-description-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
        <button onClick={onClose} className="close-button-overlay">
          <img src={require('./close.png')} alt="Close" />
        </button>
      </div>
    </div>
  );
}

export default CardOverlay;