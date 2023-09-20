import Task from '../models/kanbanBoard/task.mjs';
import Column from '../models/kanbanBoard/column.mjs';

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getColumns = async (req, res) => {
    try {
        const columns = await Column.find({});
        res.json(columns);
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

export const createColumn = async (req, res) => {
    const column = req.body;
    const newColumn = new Column(column);
    try {
        await newColumn.save();
        res.status(201).json(newColumn);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};