import React from 'react';

function CardOverlay({ task, onClose }) {
  return (
    <div className="card-overlay">
      <div className="overlay-content">
        <h3>{task.content}</h3>
        <button onClick={onClose} className="close-button-overlay">
          <img src={require('./close.png')} alt="Close" />
        </button>
      </div>
    </div>
  );
}

export default CardOverlay;
