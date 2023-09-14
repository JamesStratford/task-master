import React, { useState, useEffect } from 'react';
import initialData from './initialData';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CardOverlay from './CardOverlay';

function KanbanBoard() {
  const [state, setState] = useState(initialData);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [taskDescriptions, setTaskDescriptions] = useState({}); // Track task descriptions

  // Load task descriptions from initialData on component mount
  useEffect(() => {
    const descriptions = {};
    for (const taskId in initialData.tasks) {
      descriptions[taskId] = initialData.tasks[taskId].description || '';
    }
    setTaskDescriptions(descriptions);
  }, []);
  
  // Function to update the description in initialData
  const updateTaskDescription = (taskId, newDescription) => {
    // Update initialData with the new description
    const updatedData = {
      ...initialData,
      tasks: {
        ...initialData.tasks,
        [taskId]: {
          ...initialData.tasks[taskId],
          description: newDescription,
        },
      },
    };
    // Update the state and initialData
    setState(updatedData);
    // Update the taskDescriptions state
    setTaskDescriptions({ ...taskDescriptions, [taskId]: newDescription });
  };

  const openOverlay = (taskId) => {
    const task = state.tasks[taskId];
    const column = state.columns[task.column];
    setCurrentTask(task);
    setCurrentColumn(column); // Set the current column
    setIsOverlayOpen(true);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false); // Only close the overlay, no need to modify currentTask
  };

  const moveTaskWithinSameColumn = (column, sourceIndex, destinationIndex) => {
    const newTaskIds = Array.from(column.taskIds);
    const [movedTask] = newTaskIds.splice(sourceIndex, 1);
    newTaskIds.splice(destinationIndex, 0, movedTask);
    return { ...column, taskIds: newTaskIds };
  };

  const moveTaskToDifferentColumn = (state, source, destination, draggableId) => {
    const sourceColumn = state.columns[source.droppableId];
    const newSourceTaskIds = Array.from(sourceColumn.taskIds);
    newSourceTaskIds.splice(source.index, 1);

    const destinationColumn = state.columns[destination.droppableId];
    const newDestinationTaskIds = Array.from(destinationColumn.taskIds);
    newDestinationTaskIds.splice(destination.index, 0, draggableId);

    return {
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
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    switch (true) {
      case (destination.droppableId === source.droppableId && destination.index === source.index):
        // Case: Dropped at the same location
        return;

      case (destination.droppableId === source.droppableId && destination.index !== source.index):
        // Case: Re-ordering within the same column
        const column = state.columns[source.droppableId];
        const updatedColumn = moveTaskWithinSameColumn(column, source.index, destination.index);
        setState({
          ...state,
          columns: {
            ...state.columns,
            [source.droppableId]: updatedColumn,
          },
        });
        return;

      default:
        // Case: Moving to a different column
        const newState = moveTaskToDifferentColumn(state, source, destination, draggableId);
        setState(newState);
        return;
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



  const updateCardContent = (taskId, newContent) => {
    const updatedTasks = {
      ...state.tasks,
      [taskId]: {
        ...state.tasks[taskId],
        content: newContent,
      },
    };

    setState({
      ...state,
      tasks: updatedTasks,
    });
  };

  const removeCard = (taskId) => {
    // Filter out the task with the specified taskId to remove it
    const updatedTasks = { ...state.tasks };
    delete updatedTasks[taskId];

    // Update the columns to remove the taskId from its taskIds array
    const updatedColumns = { ...state.columns };
    for (const columnId in updatedColumns) {
      updatedColumns[columnId].taskIds = updatedColumns[columnId].taskIds.filter(
        (id) => id !== taskId
      );
    }

    // Set the updated state
    setState({
      ...state,
      tasks: updatedTasks,
      columns: updatedColumns,
    });
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
                  <Draggable draggableId={task.id} index={index} key={task.id}>
                    {(provided) => (
                      <div
                        className={`task ${editingTaskId === task.id ? 'editing' : ''}`}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        onDoubleClick={() => setEditingTaskId(task.id)}
                      >
                        {editingTaskId === task.id ? (
                          <div className="task-content">
                            <input
                              type="text"
                              value={task.content}
                              onChange={(e) => updateCardContent(task.id, e.target.value)}
                            />
                            <div className="button-container">
                              <button className="open-button" onClick={() => openOverlay(task.id)}>
                                Open Card
                              </button>
                              <button className="remove-button" onClick={() => removeCard(task.id)}>
                                Remove Card
                              </button>
                              <button className="save-button" onClick={() => setEditingTaskId(null)}>
                                Save Card
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="task-content">
                            {task.content}
                            <button className="edit-button" onClick={() => setEditingTaskId(task.id)}>
                            <img src={require('./edit.png')} alt="Edit" style={{ width: '15px', height: '15px' }} />
                            </button>
                          </div>
                        )}
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
                      description: '', // Initialize the description as empty
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
      {isOverlayOpen && (
        <CardOverlay
          task={currentTask}
          onClose={closeOverlay}
          updateTaskDescription={updateTaskDescription} // Pass the updateTaskDescription function
          taskDescription={taskDescriptions[currentTask.id]} // Pass the task description
        />
      )}
    </DragDropContext>
  );
}

export default KanbanBoard;