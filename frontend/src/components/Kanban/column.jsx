import React from 'react';

function Column(props) {
  return (
    <div className="column-container">
      <h3 className="column-title">{props.column.title}</h3>
      <div className="task-list">
        {props.tasks.map(task => (
          <div key={task.id} className="task">
            <div className="task-content">{task.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Column;
