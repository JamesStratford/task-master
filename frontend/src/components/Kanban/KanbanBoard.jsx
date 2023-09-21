import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CardOverlay from "./CardOverlay";
import axios from "axios";

function KanbanBoard() {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const [openDropdownColumnId, setOpenDropdownColumnId] = useState(null);

  const [state, setState] = useState({
    tasks: {},
    columns: [],
    columnOrder: [],
  });

  // Load task descriptions from the database on component mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-kanban-board`
      );
      setState(data.data);
    };

    fetchData();
    console.log(state);
  }, []);

  const openOverlay = (taskId) => {
    const task = state.tasks[taskId];
    setCurrentTask(task);
    setIsOverlayOpen(true);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false); // Only close the overlay, no need to modify currentTask
  };

  const moveTaskWithinSameColumn = async (
    column,
    sourceIndex,
    destinationIndex
  ) => {
    const newTaskIds = Array.from(column.taskIds);
    const [movedTask] = newTaskIds.splice(sourceIndex, 1);
    newTaskIds.splice(destinationIndex, 0, movedTask);

    // Update the column object with the new taskIds
    const updatedColumn = { ...column, taskIds: newTaskIds };

    setState({
      ...state,
      columns: state.columns.map((col) =>
        col.id === column.id ? updatedColumn : col
      ),
    });

    // Update the database
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-task-column`,
        {
          columnId: column.id,
          newColumnId: column.id,
          newColumnTaskIds: newTaskIds,
        }
      );
      console.log("Successfully updated column task IDs in the database.");
    } catch (error) {
      console.error("Failed to update column task IDs in the database:", error);
    }
  };

  const moveTaskToDifferentColumn = async (
    state,
    source,
    destination,
    draggableId
  ) => {
    // Find the source and destination columns
    const sourceColumnIndex = state.columns.findIndex(
      (column) => column.id === source.droppableId
    );
    const destinationColumnIndex = state.columns.findIndex(
      (column) => column.id === destination.droppableId
    );

    // Clone the columns array and the specific column objects
    const updatedColumns = [...state.columns];
    const updatedSourceColumn = { ...updatedColumns[sourceColumnIndex] };
    const updatedDestinationColumn = {
      ...updatedColumns[destinationColumnIndex],
    };

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
    await axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-task-column`,
      {
        taskId: draggableId,
        columnId: source.droppableId,
        newColumnId: destination.droppableId,
        newColumnTaskIds: newDestinationTaskIds,
      }
    );
  };

  const addColumn = async (newColumnTitle) => {
    console.log("Adding column");

    if (newColumnTitle.trim() === "") {
      // Don't add an empty column
      console.log("Empty column");
      return;
    }

    try {
      // Send a POST request to add the column to the database
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/add-column`,
        {
          title: newColumnTitle,
          // You can add any other necessary properties here
        }
      );

      console.log("Title", newColumnTitle);
      console.log("data: ", response.data);
      if (response.status === 201) {
        // Column was successfully added to the server
        console.log("Successfully added column to the database.");
        const newColumnData = response.data; // This should include the new column's data, including its ID
        // Create a new column object for your React state
        const newColumn = {
          id: newColumnData.id, // You may need to set this based on your logic
          title: newColumnTitle,
          taskIds: [],
          nextColumnId: newColumnData.nextColumnId, // Use the actual nextColumnId property from your server data
        };

        // Add the new column to the existing columns
        const updatedColumns = [...state.columns, newColumn];

        // Update the React state with the new column
        setState({
          ...state,
          columns: updatedColumns,
        });
      }
    } catch (error) {
      console.error("Failed to add column:", error);
    }
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
    const newTask = state.tasks[taskId];
    // Update the task description in the database
    await axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-task`,
      {
        newTask
      }
    );
  };

  const deleteColumn = async (columnId) => {
    try {
      // Send a DELETE request to delete the column in the database
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/delete-column`,
        {
          data: {
            columnId: columnId, // Pass the columnId in the request body
          },
        }
      );

      // Remove the column from the local state
      const updatedColumns = state.columns.filter(
        (column) => column.id !== columnId
      );

      // Set the updated state
      setState({
        ...state,
        columns: updatedColumns,
      });
    } catch (error) {
      console.error("Failed to delete column:", error);
    }
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

    if (type === "column") {
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
        case destination.droppableId === source.droppableId &&
          destination.index === source.index:
          return;
        case destination.droppableId === source.droppableId &&
          destination.index !== source.index:
          const column = state.columns.find(
            (col) => col.id === source.droppableId
          );
          moveTaskWithinSameColumn(column, source.index, destination.index);
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
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/add-task`,
        {
          columnId,
          newCard,
        }
      );
      console.log(newCard);

      // Then update the local state
      setState((prevState) => {
        const columnIndex = prevState.columns.findIndex(
          (column) => column.id === columnId
        );
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

  const updateCardContent = async (taskId, newContent) => {
    try {
      const newTask = state.tasks[taskId];
      newTask.content = newContent;
      const updatedTasks = {
        ...state.tasks,
        [taskId]: newTask,
      };

      setState({
        ...state,
        tasks: updatedTasks,
      });

      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-task`,
        {
          newTask,
        }
      );
    } catch (error) {
      console.error("Failed to update card content:", error);
    }
  };

  const removeCard = async (taskId) => {
    // Filter out the task with the specified taskId to remove it
    const updatedTasks = { ...state.tasks };
    delete updatedTasks[taskId];

    // Update the columns to remove the taskId from its taskIds array
    const updatedColumns = [...state.columns];
    let changedColumnId = null;
    for (let i = 0; i < updatedColumns.length; i++) {
      const column = updatedColumns[i];
      if (column.taskIds.includes(taskId)) {
        changedColumnId = column.id;
        updatedColumns[i].taskIds = column.taskIds.filter(
          (id) => id !== taskId
        );
        break;
      }
    }

    // Set the updated state
    setState({
      ...state,
      tasks: updatedTasks,
      columns: updatedColumns,
    });

    // Remove the task from the database
    await axios.delete(
      `${process.env.REACT_APP_BACKEND_URL}/api/kanban/delete-task`,
      {
        data: {
          taskId,
          changedColumnId,
        },
      }
    );
  };



  const ColumnHeader = ({ isEditing, column, provided }) => {
    const [editedColumnTitle, setEditedColumnTitle] = useState("");

    useEffect(() => {
      setEditedColumnTitle(column.title); // assuming column.title is correct
    }, [column.title]);

    const handleColumnTitleDoubleClick = useCallback(() => {
      setEditedColumnTitle(column.title);
    }, [column.title]);

    const handleEditedColumnTitleChange = useCallback((e) => {
      setEditedColumnTitle(e.target.value);
    }, []);

    const handleColumnTitleKeyPress = useCallback((e) => {
      if (e.key === "Enter") {
        const updatedColumns = state.columns.map((col) =>
          col.id === column.id ? { ...col, title: editedColumnTitle } : col
        );
        setState({ ...state, columns: updatedColumns });
      }
    }, []);

    return isEditing === column.id ? (
      <input
        type="text"
        className="column-title-input"
        value={editedColumnTitle}
        onChange={handleEditedColumnTitleChange}
        onKeyPress={handleColumnTitleKeyPress}
        autoFocus
        {...provided.dragHandleProps}
      />
    ) : (
      <h3
        className="column-title"
        {...provided.dragHandleProps}
        onDoubleClick={handleColumnTitleDoubleClick}
      >
        {column.title}
      </h3>
    );
  };


  // Dropdown Component
  const DropdownMenu = ({ isOpen, column, deleteColumn, closeDropdown }) => {
    return isOpen === column.id ? (
      <div className="dropdown-content">
        <button
          className="delete-column-button"
          onClick={() => deleteColumn(column.id)}
        >
          Delete Column
        </button>
        <button className="close-dropdown-button" onClick={closeDropdown}>
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
    );
  };

  // Task Component
  const TaskItem = ({
    task,
    isEditing,
    updateCardContent,
    setEditingTaskId,
    provided,
  }) => {
    const [localContent, setLocalContent] = useState(task.content);

    return (
      <div
        className={`task ${isEditing === task.taskId ? "editing" : ""}`}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        onDoubleClick={() => setEditingTaskId(task.taskId)}
      >
        {isEditing === task.taskId ? (
          <div className="task-content">
            <input
              type="text"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              onBlur={() => updateCardContent(task.taskId, localContent)}
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
                onClick={() => {
                  setEditingTaskId(null);
                }}
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
                src={require("./edit.png")}
                alt="Edit"
                style={{ width: "15px", height: "15px" }}
              />
            </button>
          </div>
        )}
      </div>
    );
  };

  // AddColumn Component
  const AddColumnButton = ({ addColumn }) => {
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddColumn = () => {
      if (newColumnTitle.trim() === "") {
        // Don't add an empty column
        console.log("Empty column");
        return;
      }

      // Call the addColumn function with the title
      addColumn(newColumnTitle);

      // Clear the input field and reset the state
      setNewColumnTitle("");
      setIsAdding(false);
    };

    return (
      <div className="add-column-container">
        {isAdding ? (
          <div>
            <input
              type="text"
              placeholder="Enter column title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
            />
            <button onClick={handleAddColumn}>Add Column</button>
          </div>
        ) : (
          <button className="add-column-button" onClick={() => setIsAdding(true)}>
            + Add Column
          </button>
        )}
      </div>
    );
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
            {state.columns &&
              state.columns.map((column, index) => {
                const validTaskIds = column.taskIds.filter((taskId) =>
                  state.tasks.hasOwnProperty(taskId)
                );
                const tasks = validTaskIds.map((taskId) => state.tasks[taskId]);
                return (
                  <Draggable
                    draggableId={String(column.id)}
                    index={index}
                    key={String(column.id)}
                  >
                    {(provided) => (
                      <div
                        className="column-container"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div className="column-header">
                          <ColumnHeader
                            column={column}
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
                            <div
                              className="task-list"
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {tasks &&
                                tasks.map((task, index) => (
                                  <Draggable
                                    draggableId={String(task.taskId)}
                                    index={index}
                                    key={String(task.taskId)}
                                  >
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
                              {
                                <button
                                  onClick={() => {
                                    const newCard = {
                                      taskId: `task-${Date.now()}`,
                                      content: "New Task",
                                      description: "", // Initialize the description as empty
                                      nextTaskId: null, // End of chain of tasks
                                    };
                                    addCardToColumn(column.id, newCard);
                                  }}
                                  className="add-card-button"
                                >
                                  + Add a card
                                </button>
                              }
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
            <AddColumnButton addColumn={addColumn} />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default KanbanBoard;
