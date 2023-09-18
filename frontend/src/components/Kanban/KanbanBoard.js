import React, { useState, useEffect } from 'react';
import { getInitialData, updateData } from './initialData';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CardOverlay from './CardOverlay';

function KanbanBoard() {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedColumn, setEditedColumn] = useState({ id: null, title: '' });
  const [editedColumnTitle, setEditedColumnTitle] = useState(''); 
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [taskDescriptions, setTaskDescriptions] = useState({});
  const [isEditingColumnTitle, setIsEditingColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [openDropdownColumnId, setOpenDropdownColumnId] = useState(null);
  const [state, setState] = useState({
    tasks: {},
    columns: {},
    columnOrder: []
  });
  

  // Load task descriptions from the database on component mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await getInitialData();
      setState(data);
      
      const descriptions = {};
      for (const taskId in data.tasks) {
        descriptions[taskId] = data.tasks[taskId].description || '';
      }
      setTaskDescriptions(descriptions);
    };

    fetchData();
  }, []);

  // Function to update the description in the database
  const updateTaskDescription = async (taskId, newDescription) => {
    const updatedData = {
      ...state,
      tasks: {
        ...state.tasks,
        [taskId]: {
          ...state.tasks[taskId],
          description: newDescription,
        },
      },
    };
    setState(updatedData);
    setTaskDescriptions({ ...taskDescriptions, [taskId]: newDescription });

    await updateData(updatedData); // Update the database.
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

  const addColumn = () => {
    if (newColumnTitle.trim() === '') {
      // Don't add an empty column
      return;
    }

    const newColumnId = `column-${Date.now()}`;
    const newColumn = {
      id: newColumnId,
      title: newColumnTitle,
      taskIds: [],
    };
    const updatedColumns = { ...state.columns, [newColumnId]: newColumn };
    const newColumnOrder = [...state.columnOrder, newColumnId];
    const newState = { ...state, columns: updatedColumns, columnOrder: newColumnOrder };
    setState(newState);
    setNewColumnTitle(''); // Clear the newColumnTitle
    setIsAddingColumn(false); // Close the "Add Column" input field
  };

  const deleteColumn = (columnId) => {
    const { [columnId]: deletedColumn, ...updatedColumns } = state.columns;
    const newColumnOrder = state.columnOrder.filter((id) => id !== columnId);

    // Remove tasks associated with the deleted column
    const updatedTasks = { ...state.tasks };
    deletedColumn.taskIds.forEach((taskId) => {
      delete updatedTasks[taskId];
    });

    setState({
      ...state,
      columns: updatedColumns,
      columnOrder: newColumnOrder,
      tasks: updatedTasks,
    });
  };

  const openDropdown = (columnId) => {
    setOpenDropdownColumnId(columnId);
  };

  // Function to close the dropdown menu for a column
  const closeDropdown = () => {
    setOpenDropdownColumnId(null);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return; // If not dropped on a valid droppable, do nothing

    if (type === 'column') {
      // Column dragging logic
      const newColumnOrder = Array.from(state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      // Create a new state object preserving the previous state
      const newState = {
        ...state,
        columnOrder: newColumnOrder,
      };

      setState(newState);
    } else {
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
    }
  };

  const addCardToColumn = (columnId, newCard) => {
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

    // Create a new state object preserving the previous state
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

  const handleColumnTitleDoubleClick = (columnId) => {
    // Set the edited column title when double-clicking
    const column = state.columns[columnId];
    setEditedColumnTitle(column.title);
    setIsEditingColumnTitle(columnId);
  };

  const handleEditedColumnTitleChange = (e) => {
    // Update the edited column title
    setEditedColumnTitle(e.target.value);
  };

  const handleColumnTitleKeyPress = (e, columnId) => {
    if (e.key === 'Enter') {
      // Save the edited column title when Enter key is pressed
      const updatedColumns = {
        ...state.columns,
        [columnId]: {
          ...state.columns[columnId],
          title: editedColumnTitle,
        },
      };
      setState({ ...state, columns: updatedColumns });
      setIsEditingColumnTitle(''); // Clear the editing state
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided) => (
          <div
            className="kanban-board"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {state.columnOrder.map((columnId, index) => {
              const column = state.columns[columnId];
              const tasks = column.taskIds.map((taskId) => state.tasks[taskId]);

              return (
                <Draggable draggableId={column.id} index={index} key={column.id}>
                  {(provided) => (
                    <div
                      className="column-container"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="column-header">
                        {isEditingColumnTitle === column.id ? ( // Check if currently editing
                          <input
                            type="text"
                            className="column-title-input"
                            value={editedColumnTitle}
                            onChange={handleEditedColumnTitleChange}
                            onKeyPress={(e) => handleColumnTitleKeyPress(e, column.id)}
                            onBlur={() => setIsEditingColumnTitle('')} // Clear the editing state
                            autoFocus
                          />
                        ) : (
                          <h3
                            className="column-title"
                            {...provided.dragHandleProps}
                            onDoubleClick={() => handleColumnTitleDoubleClick(column.id)}
                          >
                            {column.title}
                          </h3>
                        )}
                        <div className="dropdown top-right">
                          {openDropdownColumnId === column.id ? (
                            <div className="dropdown-content">
                              <button
                                className="delete-column-button"
                                onClick={() => deleteColumn(column.id)}
                              >
                                Delete Column
                              </button>
                              <button
                                className="close-dropdown-button"
                                onClick={closeDropdown}
                              >
                                Close
                              </button>
                            </div>
                          ) : (
                            <button
                              className="dropdown-button"
                              onClick={() => openDropdown(column.id)}
                            >
                              ...
                            </button>
                          )}
                        </div>
                      </div>
                      <Droppable droppableId={column.id} direction="vertical">
                        {(provided) => (
                          <div
                            className="task-list"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
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
                                          <button
                                            className="open-button"
                                            onClick={() => openOverlay(task.id)}
                                          >
                                            Open Card
                                          </button>
                                          <button
                                            className="remove-button"
                                            onClick={() => removeCard(task.id)}
                                          >
                                            Remove Card
                                          </button>
                                          <button
                                            className="save-button"
                                            onClick={() => setEditingTaskId(null)}
                                          >
                                            Save Card
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="task-content">
                                        {task.content}
                                        <button
                                          className="edit-button"
                                          onClick={() => setEditingTaskId(task.id)}
                                        >
                                          <img
                                            src={require('./edit.png')}
                                            alt="Edit"
                                            style={{ width: '15px', height: '15px' }}
                                          />
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
                    </div>
                  )}
                </Draggable>
              );
            })}
            {isAddingColumn ? (
              <div className="column-container">
                <input
                  type="text"
                  placeholder="Enter Column Title"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="column-title-input"
                  onKeyPress={(e) => handleColumnTitleKeyPress(e, editedColumn.id)}
                  onBlur={() => setIsEditingColumnTitle('')} // Clear the editing state
                  autoFocus
                />
                <button
                  className="add-column-button"
                  onClick={addColumn}
                >
                  Add column
                </button>
              </div>
            ) : (
              <button
                className="add-column-button"
                onClick={() => setIsAddingColumn(true)}
              >
                + Add another column
              </button>
            )}
            {isOverlayOpen && (
              <CardOverlay
                task={currentTask}
                onClose={closeOverlay}
                currentColumn={currentColumn}
                updateTaskDescription={updateTaskDescription}
                taskDescription={taskDescriptions[currentTask.id]}
              />
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default KanbanBoard;
