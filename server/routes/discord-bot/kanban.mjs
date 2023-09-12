import express from 'express';
import db from '../../db/conn.mjs';

const router = express.Router();

router.get('/getTasks', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const tasks = await db.collection('tasks').find({ userId }).toArray();

        res.status(200).json({ tasks });
    } catch (err) {
        console.error("Error fetching tasks:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
