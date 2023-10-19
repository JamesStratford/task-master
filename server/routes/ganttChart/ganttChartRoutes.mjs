import express from 'express';
const router = express.Router();
import { getTasks, updateTask } from '../../kanbanBoard/kanbanBoard.mjs';

router.get('/get-tasks', async (req, res) => {
    try {
        const tasks = await getTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/update-task-date', async (req, res) => {
    // update task dates by _id in mongo
    updateTask(req, res);
});
    

export default router;
