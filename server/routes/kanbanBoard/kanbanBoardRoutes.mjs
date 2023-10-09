import {
    addTask,
    addColumn,
    getTasks,
    getColumns,
    updateColumn,
    updateBoard,
    deleteColumn,
    assignTaskToColumn,
    updateColumnTaskIds,
    removeTaskFromColumn,
    updateTask,
    saveLabel,
    deleteTask
} from "../../kanbanBoard/kanbanBoard.mjs";
import Label from '../../models/kanbanBoard/label.mjs';
import express from 'express';
import { io } from '../../server.mjs';

const router = express.Router();

/**
 *  Hook to update the board
 * @param {SocketIO.Server} io - The socket.io server
 */
export const boardUpdatedHook = async (io) => {
    io.emit('updateBoard');
};

/**
 *  Add a task to the database
 * @param {string} columnId - The ID of the column to add the task to
 */
router.post('/add-task', async (req, res) => {
    const { columnId, newCard } = req.body;
    try {
        await addTask({ body: { ...newCard } }, res).then(async () => {
            await assignTaskToColumn({ body: { taskId: newCard.taskId, columnId } }, res);
        }).then(() => {
            boardUpdatedHook(io)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/delete-task', async (req, res) => {
    const { taskId, changedColumnId } = req.body;
    try {
        await deleteTask({ body: { taskId } }, res).then(async () => {
            if (changedColumnId) {
                await removeTaskFromColumn({ body: { taskId, changedColumnId } }, res);
            }
            res.status(200).json({ message: 'Task and column updated successfully' });
        }).then(() => {
            boardUpdatedHook(io)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.post('/add-column', async (req, res) => {
    const columnData = req.body;
    try {
        await addColumn(columnData, res).then(() => {
            boardUpdatedHook(io)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/delete-column', async (req, res) => {
    const { columnId } = req.body;
    try {
        await deleteColumn({ body: { id: columnId } }, res).then(() => {
            boardUpdatedHook(io)
        });
        res.status(200).json({ message: 'Column deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/update-column', async (req, res) => {
    const { newColumn } = req.body;
    try {
        await updateColumn({ body: { ...newColumn } }, res).then(() => {
            boardUpdatedHook(io)
        });
        res.status(200).json({ message: 'Column updated successfully' });
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
        await updateColumnTaskIds({ body: { taskId, newColumnId, newColumnTaskIds } }, res).then(async () => {
            if (columnId !== newColumnId) {
                await removeTaskFromColumn({ body: { taskId, changedColumnId: columnId } }, res);
            }
        }).then(() => {
            boardUpdatedHook(io)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/update-task', async (req, res) => {
    const task = req.body.newTask;
    try {
        await updateTask({ body: { ...task } }, res).then(() => {
            boardUpdatedHook(io);
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/update-board', async (req, res) => {
    try {
        const board = req.body;
        await updateBoard(board).then(async () => {
            boardUpdatedHook(io);
        });

        // Respond with a success message
        res.status(200).json({ message: 'Columns updated successfully.' });
    } catch (error) {
        console.error('Error updating columns:', error.message);
        res.status(500).json({ message: error.message });
    }
});

router.post('/save-label', async (req, res) => {
    try {
        await saveLabel(req, res); // Call the saveLabel function to handle the request
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;