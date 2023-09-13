import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

function Task(props) {
  return (
    <Draggable draggableId={props.task.id} index={props.index} type="task">
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {props.task.content}
        </div>
      )}
    </Draggable>
  );
}

export default Task;
