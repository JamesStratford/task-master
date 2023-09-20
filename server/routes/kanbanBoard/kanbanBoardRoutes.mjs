import { createTask, createColumn, getTasks, getColumns } from "../../kanbanBoard/kanbanBoard.mjs";
import axios from 'axios';
import express from 'express';

const router = express.Router();

router.get('/create-column', async (req, res) => {
    const column = req.query.column;
    try {
        await createColumn({ body: { column } }, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/create-task', async (req, res) => {
    const { content, column, description } = req.query;
    try {
        await createTask({ body: { content, column, description } }, res);
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

router.get('/update-task', async (req, res) => {
    const { id, content, column, description } = req.query;
    try {
        await axios.put(`${process.env.DISCORD_BOT_API_URL}/api/kanban/update-task`, { id, content, column, description });
        res.status(200).json({ message: `Updating task ${id}` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/delete-task', async (req, res) => {
    const { id } = req.query;
    try {
        await axios.delete(`${process.env.DISCORD_BOT_API_URL}/api/kanban/delete-task`, { data: { id } });
        res.status(200).json({ message: `Deleting task ${id}` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    } 
});

router.get('/delete-column', async (req, res) => {
    const { column } = req.query;
    try {
        await axios.delete(`${process.env.DISCORD_BOT_API_URL}/api/kanban/delete-column`, { data: { column } });
        res.status(200).json({ message: `Deleting column ${column}` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
