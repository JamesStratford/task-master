import { addTask, addColumn, getTasks, getColumns, deleteColumn, updateTaskDescription, assignTaskToColumn, updateColumnTaskIds, removeTaskFromColumn, updateTask, deleteTask } from "../../kanbanBoard/kanbanBoard.mjs";
import express from 'express';

const router = express.Router();

router.post('/add-task', async (req, res) => {
    const { columnId, newCard } = req.body;
    try {
        await addTask({ body: { ...newCard } }, res);
        await assignTaskToColumn({ body: { taskId: newCard.taskId, columnId } }, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/delete-task', async (req, res) => {
    const { taskId, changedColumnId } = req.body;
    try {
        await deleteTask({ body: { taskId } }, res);
        if (changedColumnId) {
            await removeTaskFromColumn({ body: { taskId, changedColumnId } }, res);
        }
        res.status(200).json({ message: 'Task and column updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.get('/add-column', async (req, res) => {
    const column = req.query.column;
    try {
        await addColumn({ body: { column } }, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/delete-column', async (req, res) => {
    const column = req.query.column;
    try {
        await deleteColumn({ body: { column } }, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/get-columns', async (req, res) => {
    try {
        const columns = await getColumns();
        res.json(columns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/get-tasks', async (req, res) => {
    try {
        const tasks = await getTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/get-kanban-board', async (req, res) => {
    try {
        const columns = await getColumns();
        const tasks = await getTasks();
        res.json({ columns, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/update-task-column', async (req, res) => {
    const taskId = req.body.taskId;
    const columnId = req.body.columnId;
    const newColumnId = req.body.newColumnId;
    const newColumnTaskIds = req.body.newColumnTaskIds;
    try {
        await updateColumnTaskIds({ body: { taskId, newColumnId, newColumnTaskIds } }, res);
        if (columnId !== newColumnId) {
            await removeTaskFromColumn({ body: { taskId, changedColumnId: columnId } }, res);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/update-task', async (req, res) => {
    const task = req.body.newTask;
    try {
        await updateTask({ body: { ...task } }, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.put('/update-task-description', async (req, res) => {
    const taskId = req.body.taskId;
    const description = req.body.description;
    try {
        await updateTaskDescription({ body: { taskId, description } }, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
