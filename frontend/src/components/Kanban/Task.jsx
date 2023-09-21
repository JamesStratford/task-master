import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

function Task(props) {
  return (
    // Wrapping the task in a Draggable component
    <Draggable draggableId={props.task.id} index={props.index} type="task">
      {(provided) => (
        // The provided props are used to make the element draggable
        <div
          {...provided.draggableProps} // Props for the draggable behavior
          {...provided.dragHandleProps} // Props for the drag handle
          ref={provided.innerRef} // Reference to the inner element
        >
          {props.task.content} {/* Displaying the task content */}
        </div>
      )}
    </Draggable>
  );
}

export default Task;
