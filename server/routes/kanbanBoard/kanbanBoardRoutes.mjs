import { addTask, addColumn, getTasks, getColumns, deleteColumn, updateTaskDescription, assignTaskToColumn, removeTaskFromColumn, updateTask, deleteTask } from "../../kanbanBoard/kanbanBoard.mjs";
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
    const { taskId, columnId } = req.body;
    console.log(req.body)
    try {
        if (columnId) {
            await removeTaskFromColumn({ body: { taskId, columnId } }, res);
        }
        await deleteTask({ body: { taskId } }, res);
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
    try {
        await assignTaskToColumn({ body: { taskId, newColumnId } }, res);
        await removeTaskFromColumn({ body: { taskId, columnId } }, res);
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
    console.log(req.body)
    const taskId = req.body.taskId;
    const description = req.body.description;
    try {
        await updateTaskDescription({ body: { taskId, description } }, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
