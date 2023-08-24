import Board from '@asseinfo/react-kanban'
import '@asseinfo/react-kanban/dist/styles.css'
import React, { useEffect } from 'react'

const KanbanBoard = () => { // Define the KanbanBoard component as a functional component
  const initialBoard = {
    columns: [
      {
        id: 1,
        title: 'Backlog',
        cards: [
          {
            id: 1,
            title: 'Add card',
            description: 'Add capability to add a card in a column'
          },
        ]
      },
      {
        id: 2,
        title: 'Doing',
        cards: [
          {
            id: 2,
            title: 'Drag-n-drop support',
            description: 'Move a card between the columns'
          },
        ]
      }
    ]
  };

  return (
    <Board initialBoard={initialBoard} /> // Render the Board component with the initial board configuration
  );
};

export default KanbanBoard;


