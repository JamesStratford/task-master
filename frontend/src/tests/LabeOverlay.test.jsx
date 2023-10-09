import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import axios from 'axios';
import LabelOverlay from '../components/Kanban/LabelOverlay'; // Adjust the import path as needed

jest.mock('axios');

describe('LabelOverlay component', () => {
  it('should add a new label and save it to the database', async () => {
    // Mock axios.post function
    axios.post.mockResolvedValueOnce();

    render(
      <LabelOverlay
        task={{}}
        cardLabels={[]}
        setCardLabels={jest.fn()}
        allLabels={[]}
        setAllLabels={jest.fn()}
        toggleLabelOverlay={jest.fn()}
        fetchAllLabels={jest.fn()}
        handleUpdateTask={jest.fn()}
        updateTaskContents={jest.fn()}
      />
    );

    // Find and interact with relevant elements
    const labelTextInput = screen.getByPlaceholderText('Enter label text');
    const createLabelButton = screen.getByText('Create Label');

    // Simulate user input and button click
    fireEvent.change(labelTextInput, { target: { value: 'New Label' } });
    fireEvent.click(createLabelButton);

    // Wait for axios and useEffect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Assertions
    // You can assert that axios.post is called with the expected arguments
    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.REACT_APP_BACKEND_URL}/api/kanban/save-label`,
      {
        labelId: expect.any(Number),
        text: 'New Label',
        color: '#FF0000', // Default color in the component
      }
    );

    // You can also check if the component state or props are updated as expected.
  });

  it('should allow adding existing labels to the current card', () => {
    // Mock axios functions and provide existing labels
    axios.post.mockResolvedValueOnce();
    const existingLabels = [
      { labelId: 1, text: 'Label1', color: '#123456' },
      { labelId: 2, text: 'Label2', color: '#789abc' },
    ];

    render(
      <LabelOverlay
        task={{}}
        cardLabels={[]}
        setCardLabels={jest.fn()}
        allLabels={existingLabels}
        setAllLabels={jest.fn()}
        toggleLabelOverlay={jest.fn()}
        fetchAllLabels={jest.fn()}
        handleUpdateTask={jest.fn()}
        updateTaskContents={jest.fn()}
      />
    );

    // Find and interact with relevant elements
    const addLabelButton = screen.getByText('Show More'); // Adjust the text as needed
    fireEvent.click(addLabelButton);

    // Simulate user selecting labels
    const label1Checkbox = screen.getByText('Label1');
    const label2Checkbox = screen.getByText('Label2');

    fireEvent.click(label1Checkbox);
    fireEvent.click(label2Checkbox);

    // Assertions
    // You can assert that the cardLabels state is updated with the selected labels
    // Also, check that axios.post is called when labels are added to the card.
  });
});
