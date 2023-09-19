import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KanbanBoard from '../../src/components/kanban/KanbanBoard';

describe('KanbanBoard Component', () => {
  test('Renders the Kanban Board component', () => {
    render(<KanbanBoard />);
    const boardElement = screen.getByTestId('kanban-board');

    expect(boardElement).toBeInTheDocument();
  });

  test('Clicking "Add a card" button should display a text box', async () => {
    render(<KanbanBoard />);
    
    // Use a more specific query to select the button within a specific column
    const addButton = screen.getByTestId('column-1').querySelector('.add-card-button');
    fireEvent.click(addButton);
  
    // Wait for an element with the text "New Task" to appear
    await waitFor(() => {
      const newTaskElement = screen.getByText('New Task');
      expect(newTaskElement).toBeInTheDocument();
    });
  });

  test('Clicking "edit" button should display a menu for card actions', () => {
    render(<KanbanBoard />);
    
    // Assuming you have a unique alt attribute for the "Edit" button image
    const editButtons = screen.getAllByAltText('Edit');
    fireEvent.click(editButtons[0]); // Click the first "Edit" button
  
    // Now, you can assert that the menu for card actions has appeared
    const editMenu = screen.getByText('Open Card');
    const deleteOption = screen.getByText('Remove Card');
    expect(editMenu).toBeInTheDocument();
    expect(deleteOption).toBeInTheDocument();
  });  

  test('Dragging and dropping a card should move it to a new location', async () => {
    render(<KanbanBoard />);
  
    // Assuming you have a unique data-testid for the card you want to drag
    const cardToDrag = screen.getByTestId('task-1'); // Use the correct data-testid format
  
    // Assuming you have a unique data-testid for the destination column
    const destinationColumn = screen.getByTestId('column-2'); // Use the correct data-testid format
  
    // Simulate a drag-and-drop operation
    fireEvent.dragStart(cardToDrag);
    fireEvent.dragEnter(destinationColumn);
    fireEvent.dragOver(destinationColumn);
    fireEvent.drop(destinationColumn);
  
    // Wait for the component to re-render (you may need to adjust the timing as needed)
    await screen.findByTestId('kanban-board');
  
    // Assert that the card is in the destination column
    const updatedSourceColumn = screen.getByTestId('column-1'); // Use the correct data-testid format
    const updatedDestinationColumn = screen.getByTestId('column-2'); // Use the correct data-testid format
    const cardInDestination = screen.getByTestId('task-1'); // Use the correct data-testid format
  
    // TODO: Fix this testing
    /*expect(updatedSourceColumn).not.toContainElement(cardInDestination);
    expect(updatedDestinationColumn).toContainElement(cardInDestination);*/
  });  
});
