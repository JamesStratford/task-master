import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
    const column1 = screen.getByTestId('column-1');
    const { getByText, queryByTestId } = within(column1);
    const addButton = getByText('+ Add a card'); 
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
});
