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

  const updateKanbanBoard = async (updatedColumns) => {
    // Update local state
    setKanbanBoard(prevKanbanColumns => {
      // prevKanbanColumns is a dict of columns : Array, and tasks : dict
      const updatedKanbanColumns = { ...prevKanbanColumns };
      updatedColumns.forEach(updatedColumn => {
        updatedKanbanColumns[updatedColumn.id] = updatedColumn;
      });
      return updatedKanbanColumns;
    });

    // Sync with backend
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-board`,
        { updatedColumns }
      );
      if (response.status !== 200) {
        console.error('Failed to update columns in the backend:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to update columns in the backend:', error);
    }
  };

  return [updateKanbanBoard]
};

