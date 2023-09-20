import Task from '../models/kanbanBoard/task.mjs';
import Column from '../models/kanbanBoard/column.mjs';

export const getTasks = async (req, res) => {
    try {
      const tasksArray = await Task.find({}).exec();
      const tasksObject = tasksArray.reduce((acc, task) => {
        acc[task.taskId] = task;
        return acc;
      }, {});
      return tasksObject;
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

export const getColumns = async (req, res) => {
    try {
        const columns = await Column.find({});

        // Initialize an empty array to hold the sorted columns
        const sortedColumns = [];
        // Find the starting column (which has no preceding column)
        let currentColumnId = columns.find(col => !columns.some(otherCol => otherCol.nextColumnId === col.id))?.id;

        // Follow the linked list to sort the columns
        while (currentColumnId) {
            const currentColumn = columns.find(col => col.id === currentColumnId);
            if (currentColumn) {
                sortedColumns.push(currentColumn);
                currentColumnId = currentColumn.nextColumnId;
            } else {
                console.error(`Column with ID ${currentColumnId} not found`);
                break;
            }
        }

        return sortedColumns;
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getColumnOrder = async (req, res) => {
    try {
        const columns = await Column.find({});
        const columnOrder = columns.map(column => column.id);
        return columnOrder;
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addTask = async (req, res) => {
    const task = req.body;
    const newTask = new Task(task);
    try {
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeTaskFromColumn = async (req, res) => {
    const { taskId, columnId } = req.body;
    try {
      const column = await Column.findOne({ id: columnId });
      if (column) {
        // Remove task from column array
        column.taskIds = column.taskIds.filter(id => id !== taskId);
        await column.save();
        res.status(200).json({ message: 'Task removed successfully' });
      } else {
        res.status(404).json({ message: 'Column not found' });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

export const assignTaskToColumn = async (req, res) => {
    const taskId = req.body.taskId;
    const columnId = req.body.columnId;
    try {
        const column = await Column.findOne({ id: columnId });
        if (column) {
            // add task to column array at end
            column.taskIds.push(taskId);
            await column.save();
        }
        return
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const addColumn = async (req, res) => {
    const column = req.body;
    const newColumn = new Column(column);
    try {
        await newColumn.save();
        res.status(201).json(newColumn);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteColumn = async (req, res) => {
    const column = req.body;
    try {
        await Column.deleteOne({ id: column.id });
        res.status(201).json(column);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateTask = async (req, res) => {
    const task = req.body;
    try {
        console.log(task)
        await Task.updateOne({ taskId: task.taskId }, { ...task });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    const taskId = req.body.taskId;
    try {
        await Task.deleteOne({ taskId });
        res.status(201).json({ taskId });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const updateTaskDescription = async (req, res) => {
    const taskId = req.body.taskId;
    const description = req.body.description;
    try {
        await Task.updateOne({ taskId }, { description });
        res.status(201).json({ taskId, description });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateColumn = async (req, res) => {
    const column = req.body;
    try {
        await Column.updateOne({ ...column }, { title: column.title });
        res.status(201).json(column);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};