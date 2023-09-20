import { createTask, addColumn, getTasks, getColumns, deleteColumn } from "../../kanbanBoard/kanbanBoard.mjs";
import express from 'express';

const router = express.Router();

router.get('/create-task', async (req, res) => {
    const { content, column, description } = req.query;
    try {
        await createTask({ body: { content, column, description } }, res);
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
    console.log('get-kanban-board');
    try {
        const columns = await getColumns();
        const tasks = await getTasks();
        res.json({ columns, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
