import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import ChecklistComponent from '../../../components/Kanban/ChecklistComponent.jsx';

jest.mock('axios');

describe('ChecklistComponent', () => {
  const taskId = '12345';
  const initialChecklist = [
    { _id: '1', description: 'Item 1', isCompleted: false },
    { _id: '2', description: 'Item 2', isCompleted: true },
  ];
  const onChecklistUpdate = jest.fn();

  beforeEach(() => {
    axios.post.mockClear();
    onChecklistUpdate.mockClear();
  });

  it('renders correctly with initial checklist data', () => {
    render(<ChecklistComponent taskId={taskId} initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('handles errors when adding a new item with empty input', () => {
    render(<ChecklistComponent taskId={taskId} initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByText('Please enter a valid checklist item.')).toBeInTheDocument();
  });

  it('adds a new checklist item', async () => {
    const newItem = { _id: '3', description: 'New Item', isCompleted: false };
    axios.post.mockResolvedValue({ status: 200, data: { checklist: [...initialChecklist, newItem] } });

    render(<ChecklistComponent taskId={taskId} initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

    fireEvent.change(screen.getByPlaceholderText('Add new item'), { target: { value: 'New Item' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => expect(screen.getByText('New Item')).toBeInTheDocument());
    expect(onChecklistUpdate).toHaveBeenCalledWith([...initialChecklist, newItem]);
  });

  it('checks off a checklist item', async () => {
    const updatedItem = { ...initialChecklist[0], isCompleted: true };
    axios.post.mockResolvedValue({ status: 200, data: { checklist: [updatedItem, initialChecklist[1]] } });

    render(<ChecklistComponent taskId={taskId} initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
    expect(onChecklistUpdate).toHaveBeenCalledWith([updatedItem, initialChecklist[1]]);
  });

  it('deletes a checklist item', async () => {
    axios.post.mockResolvedValue({ status: 200, data: { checklist: [initialChecklist[1]] } });

    render(<ChecklistComponent taskId={taskId} initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => expect(screen.queryByText('Item 1')).not.toBeInTheDocument());
    expect(onChecklistUpdate).toHaveBeenCalledWith([initialChecklist[1]]);
  });

  it('handles errors from API calls when adding items', async () => {
    axios.post.mockRejectedValue(new Error('API error'));

    render(<ChecklistComponent taskId={taskId} initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

    fireEvent.change(screen.getByPlaceholderText('Add new item'), { target: { value: 'New Item' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(onChecklistUpdate).not.toHaveBeenCalled();
  });

  it('handles errors from API calls when deleting items', async () => {
    axios.post.mockRejectedValue(new Error('API error'));

    render(<ChecklistComponent taskId={taskId} initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(onChecklistUpdate).not.toHaveBeenCalled();
  });

  it('updates the value of the input for a new checklist item', () => {
    render(<ChecklistComponent taskId={taskId} initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

    const input = screen.getByPlaceholderText('Add new item');
    fireEvent.change(input, { target: { value: 'Test input' } });
    expect(input.value).toBe('Test input');
  });
});

