import React, { useState } from 'react';
import initialData from './initialData';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function KanbanBoard() {
  const [state, setState] = useState(initialData);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Check if the task was dropped outside a valid droppable area
    if (!destination) {
      return;
    }

    // Check if the task was dropped in a different column
    if (
      destination.droppableId !== source.droppableId ||
      destination.index !== source.index
    ) {
      // Create a copy of the source column
      const sourceColumn = state.columns[source.droppableId];
      const newSourceTaskIds = Array.from(sourceColumn.taskIds);
      newSourceTaskIds.splice(source.index, 1);

      // Create a copy of the destination column
      const destinationColumn = state.columns[destination.droppableId];
      const newDestinationTaskIds = Array.from(destinationColumn.taskIds);
      newDestinationTaskIds.splice(destination.index, 0, draggableId);

      // Update the state with the new task orders
      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [source.droppableId]: {
            ...sourceColumn,
            taskIds: newSourceTaskIds,
          },
          [destination.droppableId]: {
            ...destinationColumn,
            taskIds: newDestinationTaskIds,
          },
        },
      };

      setState(newState);
    }
  };

  const addCardToColumn = (columnId, newCard) => {
    // Update the state to add the new card to the specified column
    const updatedColumns = {
      ...state.columns,
      [columnId]: {
        ...state.columns[columnId],
        taskIds: [...state.columns[columnId].taskIds, newCard.id],
      },
    };

    const updatedTasks = {
      ...state.tasks,
      [newCard.id]: newCard,
    };

    const newState = {
      ...state,
      columns: updatedColumns,
      tasks: updatedTasks,
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
                <button
                  onClick={() => {
                    const newCard = {
                      id: `new-card-${Date.now()}`,
                      content: 'New Task',
                    };
                    addCardToColumn(column.id, newCard);
                  }}
                  className="add-card-button"
                >
                  + Add a card
                </button>
              </div>
            )}
          </Droppable>
        );
      })}
    </DragDropContext>
  );
}
export default KanbanBoard;
