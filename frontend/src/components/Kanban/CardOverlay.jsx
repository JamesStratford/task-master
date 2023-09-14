import React, { useState } from 'react';

function CardOverlay({ task, onClose, currentColumn }) {
  const [description, setDescription] = useState(task.description || '');
  const [isInputFocused, setInputFocused] = useState(false);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSaveDescription = () => {
    console.log('Description saved:', description);
    onClose();
  };

  const handleCancelEdit = () => {
    // Handle canceling the edit here, for example, reset the description to its original value.
    // You can use setDescription to reset the description in state.
    // Once canceled, you can set isInputFocused to false.
    setDescription(task.description || '');
    setInputFocused(false);
  };

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
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
          {isInputFocused && (
            <div className="input-button-container">
              <button className="save-description-btn" onClick={handleSaveDescription}>
                Save
              </button>
              <button className="cancel-description-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          )}
        </div>
        <button onClick={onClose} className="close-button-overlay">
          <img src={require('./close.png')} alt="Close" />
        </button>
      </div>
    </div>
  );
}

export default CardOverlay;
