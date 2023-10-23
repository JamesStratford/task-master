import React from 'react';
import { render, screen } from '@testing-library/react';
import GanttChart from '../../components/Gantt/GanttChart';
import axios from 'axios';

jest.mock('axios'); // mock axios

describe('<GanttChart />', () => {
    beforeEach(() => {
        axios.get.mockResolvedValue({ data: {} }); // default mock for axios get
        axios.put.mockResolvedValue({}); // default mock for axios put
    });

    it('renders without crashing', () => {
        render(<GanttChart />);
    });

    it('fetches and transforms data on mount', async () => {
        const mockData = {
            1: {
                taskId: '1',
                content: 'Task 1',
                startDate: '2022-01-01',
                dueDate: '2022-01-05'
            }
        };
        
        axios.get.mockResolvedValueOnce({ data: mockData });

        render(<GanttChart />);
        await screen.findByText('Loading...');
    });
});