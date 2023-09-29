import { useEffect } from 'react';
import axios from 'axios';

export const useKanban = (socket, setKanbanBoard) => {
  useEffect(() => {
    const fetchData = async () => {
      const data = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-kanban-board`
      );
      setKanbanBoard(data.data);
    };
    socket.on('updateBoard', () => {
      fetchData();
    });

    fetchData();
  }, [socket, setKanbanBoard]);

  const updateKanbanBoard = async (updatedColumns, updatedTasks) => {
    // Update local state
    setKanbanBoard(prevKanbanColumns => {
      const updatedKanbanColumns = { ...prevKanbanColumns };

      // Update columns
      updatedColumns.forEach(updatedColumn => {
        updatedKanbanColumns.columns[updatedColumn.id] = updatedColumn;
      });

      // Update tasks
      for (const taskId in updatedTasks) {
        updatedKanbanColumns.tasks[taskId] = updatedTasks[taskId];
      }

      return updatedKanbanColumns;
    });

    // Sync with backend
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-board`,
        { updatedColumns, updatedTasks }
      );
      if (response.status !== 200) {
        console.error('Failed to update the board in the backend:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to update the board in the backend:', error);
    }
  };

  return [updateKanbanBoard];
};

