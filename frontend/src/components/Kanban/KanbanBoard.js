import React, { useState } from 'react';
import initialData from './initialData';
import Column from './column';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function KanbanBoard() {
  const [state, setState] = useState(initialData);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Check if the task was dropped outside a valid droppable area
    if (!destination) {
      return;
    }

    // Check if the task was dropped in a different position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Perform the reorder operation in your state
    const column = state.columns[source.droppableId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.splice(source.index, 1);
    newTaskIds.splice(destination.index, 0, draggableId);

    const newColumn = {
      ...column,
      taskIds: newTaskIds,
    };

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newColumn.id]: newColumn,
      },
    };

    setState(newState);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {state.columnOrder.map((columnId) => {
        const column = state.columns[columnId];
        const tasks = column.taskIds.map((taskId) => state.tasks[taskId]);
        
        return (
          <Droppable droppableId={column.id} key={column.id}>
            {(provided) => (
              <div
                className="column-container"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3 className="column-title">{column.title}</h3>
                {tasks.map((task, index) => (
                  <Draggable
                    draggableId={task.id}
                    index={index}
                    key={task.id}
                  >
                    {(provided) => (
                      <div
                        className="task"
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
                        <div className="task-content">{task.content}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        );
      })}
    </DragDropContext>
  );
}
export default KanbanBoard;
