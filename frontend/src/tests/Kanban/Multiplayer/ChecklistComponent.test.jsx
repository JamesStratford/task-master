import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ChecklistComponent from './ChecklistComponent'; // adjust this import path if needed

const mockAxios = new MockAdapter(axios);

describe('<ChecklistComponent />', () => {
    const initialChecklist = [
        { description: 'Initial item 1', isCompleted: false, _id: '1' },
        { description: 'Initial item 2', isCompleted: true, _id: '2' },
    ];
    const mockURL = process.env.REACT_APP_BACKEND_URL;

    beforeEach(() => {
        mockAxios.reset();
    });

    it('renders checklist items', () => {
        const { getByText } = render(<ChecklistComponent initialChecklist={initialChecklist} onChecklistUpdate={jest.fn()} />);
        expect(getByText('Initial item 1')).toBeInTheDocument();
        expect(getByText('Initial item 2')).toBeInTheDocument();
    });

    it('adds a new checklist item', async () => {
        const onChecklistUpdate = jest.fn();
        const { getByPlaceholderText, getByText } = render(<ChecklistComponent initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

        mockAxios.onPost(`${mockURL}/api/kanban/add-checklist-item`).reply(200);

        userEvent.type(getByPlaceholderText('Add new item'), 'New item');
        userEvent.click(getByText('Add'));

        await waitFor(() => expect(getByText('New item')).toBeInTheDocument());
        expect(onChecklistUpdate).toHaveBeenCalledWith([...initialChecklist, { description: 'New item', isCompleted: false }]);
    });

    it('deletes a checklist item', async () => {
        const onChecklistUpdate = jest.fn();
        const { getByText } = render(<ChecklistComponent initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

        mockAxios.onPost(`${mockURL}/api/kanban/delete-checklist-item`).reply(200);

        userEvent.click(getByText('Delete'));

        await waitFor(() => expect(getByText('Initial item 1')).not.toBeInTheDocument());
        expect(onChecklistUpdate).toHaveBeenCalledWith([initialChecklist[1]]);
    });

    it('toggles checklist item completion status', async () => {
        const onChecklistUpdate = jest.fn();
        const { getByText } = render(<ChecklistComponent initialChecklist={initialChecklist} onChecklistUpdate={onChecklistUpdate} />);

        mockAxios.onPost(`${mockURL}/api/kanban/update-checklist-item-status`).reply(200);

        userEvent.click(getByText('Initial item 1').closest('li').querySelector('input'));

        await waitFor(() => {
            const toggledItem = getByText('Initial item 1').closest('li').querySelector('input');
            expect(toggledItem.checked).toBe(true);
        });
        expect(onChecklistUpdate).toHaveBeenCalledWith([
            { ...initialChecklist[0], isCompleted: true },
            initialChecklist[1]
        ]);
    });

    it('displays error for invalid checklist input', () => {
        const { getByText, getByPlaceholderText } = render(<ChecklistComponent initialChecklist={initialChecklist} onChecklistUpdate={jest.fn()} />);

        userEvent.type(getByPlaceholderText('Add new item'), '  '); // only spaces
        userEvent.click(getByText('Add'));

        expect(getByText('Please enter a valid checklist item.')).toBeInTheDocument();
    });
});
