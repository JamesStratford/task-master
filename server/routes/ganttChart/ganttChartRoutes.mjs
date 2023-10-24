import express from 'express';
import { getTasks, updateTask } from '../../kanbanBoard/kanbanBoard.mjs';

const router = express.Router();

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
