import React from 'react';

function CardOverlay({ task, onClose }) {
  return (
    <div className="card-overlay">
      <div className="overlay-content">
        <h3>{task.content}</h3>
        {/* You can add more card details here */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default CardOverlay;
