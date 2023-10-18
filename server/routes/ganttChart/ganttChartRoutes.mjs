import express from 'express';
const router = express.Router();
import { getTasks } from '../../kanbanBoard/kanbanBoard.mjs';


router.get('/get-tasks', async (req, res) => {
    try {
        const tasks = await getTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
