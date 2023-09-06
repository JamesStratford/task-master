import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

function Column(props) {
  return (
    <div className="column-container">
      <h3 className="column-title">{props.column.title}</h3>
      <Droppable droppableId={props.column.id}>
        {(provided) => (
          <div
            className="task-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {props.tasks.map((task, index) => (
              <div key={task.id} task={task} index={index} className="task">
                <div className="task-content">{task.content}</div>
              </div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default Column;
