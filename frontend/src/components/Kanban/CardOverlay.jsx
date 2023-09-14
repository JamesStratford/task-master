import React from 'react';

function CardOverlay({ task, onClose, currentColumn }) {
  return (
    <div className="card-overlay">
      <div className="overlay-content">
        <div className="task-details">
          <h4>{task.content}</h4>
          {task.column && (
            <p className="task-in-column">in column: {currentColumn ? currentColumn.title : ''}</p>
          )}
        </div>
        <div className="labels">
          <h5>
            Labels
            <button className="add-labels-btn">+</button>
          </h5>
        </div>
        <div className="acceptance-tests">
          <h5>
            Acceptance Tests
            <button className="add-acceptance-tests-btn">+</button>
          </h5>
        </div>
        <button onClick={onClose} className="close-button-overlay">
          <img src={require('./close.png')} alt="Close" />
        </button>
      </div>
    </div>
  );
}

export default CardOverlay;
