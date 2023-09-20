import Task from '../models/kanbanBoard/task.mjs';
import Column from '../models/kanbanBoard/column.mjs';

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({});
        return tasks;
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getColumns = async (req, res) => {
    try {
        const columns = await Column.find({});

        // Initialize an empty array to hold the sorted columns
        const sortedColumns = [];
        
        // Find the starting column (which has no preceding column)
        let currentColumnId = columns.find(col => !columns.some(otherCol => otherCol.nextColumnId === col.id))?.id;
        
        // Follow the linked list to sort the columns
        while (currentColumnId) {
            const currentColumn = columns.find(col => col.id === currentColumnId);
            if (currentColumn) {
                sortedColumns.push(currentColumn);
                currentColumnId = currentColumn.nextColumnId;
            } else {
                console.error(`Column with ID ${currentColumnId} not found`);
                break;
            }
        }

        return res.status(200).json(sortedColumns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getColumnOrder = async (req, res) => {
    try {
        const columns = await Column.find({});
        const columnOrder = columns.map(column => column.id);
        return columnOrder;
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTask = async (req, res) => {
    const task = req.body;
    const newTask = new Task(task);
    try {
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const addColumn = async (req, res) => {
    const column = req.body;
    const newColumn = new Column(column);
    try {
        await newColumn.save();
        res.status(201).json(newColumn);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};