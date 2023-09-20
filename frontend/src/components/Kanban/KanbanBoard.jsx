import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CardOverlay from './CardOverlay';
import axios from 'axios';

function KanbanBoard() {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedColumnTitle, setEditedColumnTitle] = useState('');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isEditingColumnTitle, setIsEditingColumnTitle] = useState('');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [openDropdownColumnId, setOpenDropdownColumnId] = useState(null);

  const [state, setState] = useState({
    tasks: {},
    columns: [],
  });



  // Load task descriptions from the database on component mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-kanban-board`);
      setState(data.data);
    };

    fetchData();
    console.log(state)
  }, []);

  const openOverlay = (taskId) => {
    const task = state.tasks[taskId];
    setCurrentTask(task);
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

  const moveTaskToDifferentColumn = async (state, source, destination, draggableId) => {
    // Find the source and destination columns
    const sourceColumnIndex = state.columns.findIndex(column => column.id === source.droppableId);
    const destinationColumnIndex = state.columns.findIndex(column => column.id === destination.droppableId);

    // Clone the columns array and the specific column objects
    const updatedColumns = [...state.columns];
    const updatedSourceColumn = { ...updatedColumns[sourceColumnIndex] };
    const updatedDestinationColumn = { ...updatedColumns[destinationColumnIndex] };

    
    // Update the taskIds array for the source column
    const newSourceTaskIds = Array.from(updatedSourceColumn.taskIds);
    newSourceTaskIds.splice(source.index, 1);
    updatedSourceColumn.taskIds = newSourceTaskIds;
    
    // Update the taskIds array for the destination column
    const newDestinationTaskIds = Array.from(updatedDestinationColumn.taskIds);
    newDestinationTaskIds.splice(destination.index, 0, draggableId);
    updatedDestinationColumn.taskIds = newDestinationTaskIds;
    
    // Update the specific columns in the columns array
    updatedColumns[sourceColumnIndex] = updatedSourceColumn;
    updatedColumns[destinationColumnIndex] = updatedDestinationColumn;
    
    // Create a new state object preserving the previous state
    const newState = {
      ...state,
      columns: updatedColumns,
    };
    
    setState(newState);
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-task-column`, {
      taskId: draggableId,
      columnId: source.droppableId,
      newColumnId: destination.droppableId
    });
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
  };

  const updateTaskDescription = async (taskId, description) => {
    const updatedTasks = {
      ...state.tasks,
      [taskId]: {
        ...state.tasks[taskId],
        description,
      },
    };
    
    setState({
      ...state,
      tasks: updatedTasks,
    });
    // Update the task description in the database
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-task-description`, {
      taskId,
      description
    })

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
      const newColumns = Array.from(state.columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      // Create a new state object preserving the previous state
      const newState = {
        ...state,
        columns: newColumns,
      };

      setState(newState);
    } else {
      // Task dragging logic
      switch (true) {
        case (destination.droppableId === source.droppableId && destination.index === source.index):
          return;
        case (destination.droppableId === source.droppableId && destination.index !== source.index):
          const column = state.columns.find(col => col.id === source.droppableId);
          const updatedColumn = moveTaskWithinSameColumn(column, source.index, destination.index);
          const updatedColumns = state.columns.map(col => col.id === source.droppableId ? updatedColumn : col);
          setState({
            ...state,
            columns: updatedColumns,
          });
          return;
        default:
          moveTaskToDifferentColumn(state, source, destination, draggableId);
          return;
      }
    }
  };

  const addCardToColumn = async (columnId, newCard) => {
    try {
      // Add the new card to the database first
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/kanban/add-task`, {
        columnId,
        newCard
      });
      console.log(newCard)

  
      // Then update the local state
      setState(prevState => {
        const columnIndex = prevState.columns.findIndex(column => column.id === columnId);
        if (columnIndex === -1) return prevState; // Column not found
  
        const updatedColumns = [...prevState.columns];
        const updatedColumn = { ...updatedColumns[columnIndex] };
        updatedColumn.taskIds = [...updatedColumn.taskIds, newCard.taskId];
        updatedColumns[columnIndex] = updatedColumn;
        return {
          ...prevState,
          columns: updatedColumns,
          tasks: {
            ...prevState.tasks,
            [newCard.taskId]: newCard,
          },
        };
      });
    } catch (error) {
      console.error("Failed to add card:", error);
    }
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

  // Column Header Component
  const ColumnHeader = ({
    isEditing,
    column,
    handleColumnTitleDoubleClick,
    editedColumnTitle,
    handleEditedColumnTitleChange,
    handleColumnTitleKeyPress,
    provided  // New prop
  }) => {
    return isEditing === column.id ? (
      <input
        type="text"
        className="column-title-input"
        value={editedColumnTitle}
        onChange={handleEditedColumnTitleChange}
        onKeyPress={(e) => handleColumnTitleKeyPress(e, column.id)}
        autoFocus
      />
    ) : (
      <h3
        className="column-title"
        {...provided.dragHandleProps}  // Make this the drag handle
        onDoubleClick={() => handleColumnTitleDoubleClick(column.id)}
      >
        {column.title}
      </h3>
    );
  };

  // Dropdown Component
  const DropdownMenu = ({ isOpen, column, deleteColumn, closeDropdown }) => {
    return isOpen === column.id ? (
      <div className="dropdown-content">
        <button className="delete-column-button" onClick={() => deleteColumn(column.id)}>Delete Column</button>
        <button className="close-dropdown-button" onClick={closeDropdown}>Close</button>
      </div>
    ) : (
      <button className="dropdown-button" onClick={() => openDropdown(column.id)}>...</button>
    );
  };

  // Task Component
  const TaskItem = ({ task, isEditing, updateCardContent, setEditingTaskId, provided }) => {
    return (
      <div
        className={`task ${isEditing === task.taskId ? 'editing' : ''}`}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        onDoubleClick={() => setEditingTaskId(task.taskId)}
      >
        {isEditing === task.taskId ? (
          <div className="task-content">
            <input
              type="text"
              value={task.content}
              onChange={(e) => updateCardContent(task.taskId, e.target.value)}
            />
            <div className="button-container">
              <button
                className="open-button"
                onClick={() => openOverlay(task.taskId)}
              >
                Open Card
              </button>
              <button
                className="remove-button"
                onClick={() => removeCard(task.taskId)}
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
              onClick={() => setEditingTaskId(task.taskId)}
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
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided) => (
          <div className="kanban-board" ref={provided.innerRef} {...provided.droppableProps}>
            {state.columns && state.columns.map((column, index) => {
              const validTaskIds = column.taskIds.filter(taskId => state.tasks.hasOwnProperty(taskId));
              const tasks = validTaskIds.map(taskId => state.tasks[taskId]);
              return (
                <Draggable draggableId={String(column.id)} index={index} key={String(column.id)}>
                  {(provided) => (
                    <div className="column-container" ref={provided.innerRef} {...provided.draggableProps}>
                      <div className="column-header">
                        <ColumnHeader
                          isEditing={isEditingColumnTitle}
                          column={column}
                          handleColumnTitleDoubleClick={handleColumnTitleDoubleClick}
                          editedColumnTitle={editedColumnTitle}
                          handleEditedColumnTitleChange={handleEditedColumnTitleChange}
                          handleColumnTitleKeyPress={handleColumnTitleKeyPress}
                          provided={provided}
                        />
                        <DropdownMenu
                          isOpen={openDropdownColumnId}
                          column={column}
                          deleteColumn={deleteColumn}
                          closeDropdown={closeDropdown}
                        />
                      </div>
                      <Droppable droppableId={column.id} direction="vertical">
                        {(provided) => (
                          <div className="task-list" ref={provided.innerRef} {...provided.droppableProps}>
                            {tasks && tasks.map((task, index) => (
                              <Draggable draggableId={String(task.taskId)} index={index} key={String(task.taskId)}>
                                {(provided) => (
                                  <TaskItem
                                    task={task}
                                    isEditing={editingTaskId}
                                    updateCardContent={updateCardContent}
                                    setEditingTaskId={setEditingTaskId}
                                    provided={provided}
                                  />
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {<button
                              onClick={() => {
                                const newCard = {
                                  taskId: `task-${Date.now()}`,
                                  content: 'New Task',
                                  description: '', // Initialize the description as empty
                                  nextTaskId: null, // End of chain of tasks
                                };
                                addCardToColumn(column.id, newCard);
                              }}
                              className="add-card-button"
                            >
                              + Add a card
                            </button>}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {isOverlayOpen && (
              <CardOverlay
                task={currentTask}
                onClose={closeOverlay}
                updateTaskDescription={updateTaskDescription}
              />
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default KanbanBoard;
