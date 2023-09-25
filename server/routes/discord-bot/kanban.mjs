import express from 'express';
import Task from '../../models/kanbanBoard/task.mjs';
import "../../loadEnvironment.mjs";

const router = express.Router();

router.get('/getTasks', async (req, res) => {
    const authToken = req.headers.authorization?.split(" ")[1];
    if (authToken !== `${process.env.BOT_SERVER_AUTH_TOKEN}`) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const tasks = await Task.find({ userId : userId });
        res.status(200).json({ tasks });
    } catch (err) {
        console.error("Error fetching tasks:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
