import { useEffect, useState } from 'react';
import axios from 'axios';

export const useKanban = (socket, kanbanBoard, setKanbanBoard) => {
  const [shouldUpdateBackend, setShouldUpdateBackend] = useState(false);
  const [allLabels, setAllLabels] = useState([]);


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

    console.log("Fetching Data for Board")
    fetchData();
  }, [socket, setKanbanBoard]);


  const updateKanbanBoard = async (updatedColumns, updatedTasks) => {
    // Update local state
    setKanbanBoard(prevKanbanColumns => {
      const updatedKanbanColumns = {
        ...prevKanbanColumns,
        columns: updatedColumns,
        tasks: updatedTasks
      };
      return updatedKanbanColumns;
    });

    // Set the flag to make an API call
    setShouldUpdateBackend(true);
  };

  useEffect(() => {
    // Function to make API call
    const updateBackend = async () => {
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/kanban/update-board`,
          {
            updatedColumns: kanbanBoard.columns,
            updatedTasks: kanbanBoard.tasks
          }
        );
        if (response.status !== 200) {
          console.error('Failed to update the board in the backend:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to update the board in the backend:', error);
      }
    };

    // Make an API call if shouldUpdateBackend is true
    if (shouldUpdateBackend) {
      updateBackend();
      setShouldUpdateBackend(false); // Reset the flag after making an API call
    }
  }, [socket, shouldUpdateBackend, kanbanBoard]);


  useEffect(() => {
    const fetchAllLabels = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/kanban/get-all-labels`
        );

        const allExistingLabels = response.data;

        setAllLabels(allExistingLabels);
      } catch (error) {
        console.error("Failed to fetch labels:", error);
      }
    };
    fetchAllLabels();
  }
    , []);



  return [updateKanbanBoard, setAllLabels, allLabels];
};

