import React, { useState, useContext, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CardOverlay from "./CardOverlay";
import axios from "axios";
import Task from "./Task";
import Column from "./Column";
import AddColumnButton from "./AddColumnButton";
import DropdownMenu from "./DropDownMenu";
import { SocketContext } from "./Multiplayer/SocketContext";
import { KanbanContext } from "./Multiplayer/KanbanContext";
import { MultiplayerContext } from "./Multiplayer/MultiplayerContext";
import { useKanban } from "./useKanban";

function KanbanBoard({ userInfo }) {
  const socket = useContext(SocketContext);
  const { kanbanColumns, setKanbanColumns } = useContext(KanbanContext);
  const { remoteDrags } = useContext(MultiplayerContext);
  const [updateKanbanBoard, setAllLabels, allLabels] = useKanban(
    socket,
    kanbanColumns,
    setKanbanColumns
  );

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [openDropdownColumnId, setOpenDropdownColumnId] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    /*
     * Fetch all users from the database.
     */
    async function fetchUsers() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-users`
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    fetchUsers();
  }, []);

  const toggleOverlay = (taskId) => {
    if (isOverlayOpen) {
      setIsOverlayOpen(false);
    } else {
      const task = kanbanColumns.tasks[taskId];
      setCurrentTask(task);
      setIsOverlayOpen(true);
    }
  };

  const moveTaskWithinSameColumn = async (column, sourceIndex, destinationIndex) => {
    const newTaskIds = Array.from(column.taskIds);
    const [movedTask] = newTaskIds.splice(sourceIndex, 1);
    newTaskIds.splice(destinationIndex, 0, movedTask);

    // Update the column object with the new taskIds
    const updatedColumn = { ...column, taskIds: newTaskIds };

    // Get the updated columns array
    const updatedColumns = kanbanColumns.columns.map((col) =>
      col.id === column.id ? updatedColumn : col
    );

    // Call the updateKanbanBoard function
    await updateKanbanBoard(updatedColumns, kanbanColumns.tasks);
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
  
    // Use the updateKanbanBoard function to update local state
    updateKanbanBoard(updatedColumns, kanbanColumns.tasks);
  };

  const addColumn = async (newColumnTitle) => {
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
        }
      );
      if (response.status === 201) {
        // Column was successfully added to the server
        const newColumnData = response.data;
        const newColumn = {
          id: newColumnData.id,
          title: newColumnTitle,
          taskIds: [],
          nextColumnId: newColumnData.nextColumnId,
        };

        const updatedColumns = [...kanbanColumns.columns, newColumn];
        const currentTasks = kanbanColumns.tasks || {};

        await updateKanbanBoard(updatedColumns, currentTasks);
      }
    } catch (error) {
      console.error("Failed to add column:", error);
    }
  };

  const deleteColumn = async (columnId) => {
    try {
      const updatedColumns = kanbanColumns["columns"].filter(
        (column) => column.id !== columnId
      );
      const updatedTasks = kanbanColumns["tasks"] || {};
      // Set the updated state
      setKanbanColumns({
        ...kanbanColumns,
        columns: updatedColumns,
      });

      // Remove the column from the database
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/delete-column`,
        {
          data: {
            coulumnId: columnId,
          },
        }
      );

      await updateKanbanBoard(updatedColumns, updatedTasks);
    } catch (error) {
      console.error("Failed to delete column:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return; // If not dropped on a valid droppable, do nothing

    if (type === "column") {
      // Column dragging logic
      const newColumns = Array.from(kanbanColumns.columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      const updatedTasks = kanbanColumns.tasks || {};

      await updateKanbanBoard(newColumns, updatedTasks);
    } else {
      // Task dragging logic
      switch (true) {
        case destination.droppableId === source.droppableId &&
          destination.index === source.index:
          return;
        case destination.droppableId === source.droppableId &&
          destination.index !== source.index:
          const column = kanbanColumns.columns.find(
            (col) => col.id === source.droppableId
          );
          moveTaskWithinSameColumn(column, source.index, destination.index);
          return;
        default:
          moveTaskToDifferentColumn(
            kanbanColumns,
            source,
            destination,
            draggableId
          );
          return;
      }
    }
  };

  const addCardToColumn = async (columnId, newCard) => {
    try {
      // Find the column to which the card should be added
      const columnIndex = kanbanColumns.columns.findIndex(
        (column) => column.id === columnId
      );
      if (columnIndex === -1) {
        console.error("Column not found:", columnId);
        return; // Column not found
      }

      // Set the start_date to the current date and due_date to null
      const currentDate = new Date();
      const formattedStartDate = currentDate.toISOString().split("T")[0]; // Get current date in "YYYY-MM-DD" format
      newCard.startDate = formattedStartDate;
      newCard.dueDate = null;

      // Send a POST request to add the task to the backend
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/add-task`,
        {
          columnId,
          newCard,
        }
      );

      if (response.status === 201) {
        // Task was successfully added to the server
        const addedTask = response.data;

        // Clone the columns and tasks to avoid mutating state directly
        const updatedColumns = [...kanbanColumns.columns];
        const updatedTasks = { ...kanbanColumns.tasks };

        // Prepare the newTask object and add it to updatedTasks
        const newTask = {
          ...newCard,
          ...addedTask, // Include any additional data returned by the server
        };
        updatedTasks[newTask.id] = newTask;

        // Add the new task's id to the taskIds array of the appropriate column
        const updatedColumn = { ...updatedColumns[columnIndex] };
        updatedColumn.taskIds = [...updatedColumn.taskIds, newTask.id];
        updatedColumns[columnIndex] = updatedColumn;

        // Call updateKanbanBoard to update local state and sync with the backend
        await updateKanbanBoard(updatedColumns, updatedTasks);
      }
    } catch (error) {
      console.error("Failed to add card:", error);
    }
  };

  const removeCard = async (taskId) => {
    // Filter out the task with the specified taskId to remove it
    const updatedTasks = { ...kanbanColumns.tasks };
    delete updatedTasks[taskId];

    // Update the columns to remove the taskId from its taskIds array
    const updatedColumns = [...kanbanColumns.columns];
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
    setKanbanColumns({
      ...kanbanColumns,
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

  const handleUpdateColumn = async (column, editedColumnTitle) => {
    const updatedColumns = kanbanColumns.columns.map((col) =>
      col.id === column.id ? { ...col, title: editedColumnTitle } : col
    );
    const updatedTasks = kanbanColumns.tasks;
    //await updateColumns(updatedColumns);
    await updateKanbanBoard(updatedColumns, updatedTasks);
  };

  // Update all contents within a task
  const updateTaskContents = async (updatedTask) => {
    try {
      // Update the task in the local state
      setKanbanColumns((prevState) => ({
        ...prevState,
        tasks: {
          ...prevState.tasks,
          [updatedTask.taskId]: updatedTask,
        },
      }));

      // Update the task in the database
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-task`,
        {
          newTask: updatedTask,
        }
      );
    } catch (error) {
      console.error("Failed to update task:", error);
      // You can add further error handling here, such as showing an error message to the user.
    }
  };

  return (
    <DragDropContext
      onDragStart={(start) => {
        // Emit socket.io event for drag start
        socket.emit("dragStart", { ...start, userInfo });
      }}
      onDragUpdate={(update) => {
        // Emit socket.io event for drag update
        socket.emit("dragUpdate", { ...update, userInfo: userInfo });
      }}
      onDragEnd={(result) => {
        onDragEnd(result);

        // Emit socket.io event for drag end
        socket.emit("dragEnd", { ...result, userInfo: userInfo });
      }}
    >
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided) => (
          <div
            className="kanban-board"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ overflow: "hidden" }}
          >
            {kanbanColumns.columns &&
              kanbanColumns.columns.map((column, index) => {
                const validTaskIds = column.taskIds.filter((taskId) =>
                  kanbanColumns.tasks.hasOwnProperty(taskId)
                );
                const tasks = validTaskIds.map(
                  (taskId) => kanbanColumns.tasks[taskId]
                );
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
                          <Column
                            column={column}
                            handleUpdateColumn={handleUpdateColumn}
                            provided={provided}
                          />
                          <DropdownMenu
                            isOpen={openDropdownColumnId}
                            column={column}
                            deleteColumn={deleteColumn}
                            setOpenDropdownColumnId={setOpenDropdownColumnId}
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
                                      <Task
                                        task={task}
                                        isEditing={editingTaskId}
                                        removeCard={removeCard}
                                        openOverlay={toggleOverlay}
                                        updateTaskContents={updateTaskContents}
                                        setEditingTaskId={setEditingTaskId}
                                        provided={provided}
                                        style={{
                                          ...provided.draggableProps.style,
                                          backgroundColor: remoteDrags[
                                            String(task.taskId)
                                          ]
                                            ? "red"
                                            : "white", // Change background color if being dragged remotely
                                        }}
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
                onClose={toggleOverlay}
                updateTaskContents={updateTaskContents}
                allLabels={allLabels}
                setAllLabels={setAllLabels}
                users={users}
                setUsers={setUsers}
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
