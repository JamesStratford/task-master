import Task from '../models/kanbanBoard/task.mjs';
import Column from '../models/kanbanBoard/column.mjs';
import Label from '../models/kanbanBoard/label.mjs';

/**
*   Add a task to the database
*   @param {string} task - The task to be added
*/
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

/**
*   Update a task in the database
*   @param {string} taskId - The ID of the task to be updated
*/
export const updateTask = async (req, res) => {
    const task = req.body;
    try {
        await Task.updateOne({ taskId: task.taskId }, { ...task });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
*   Delete a task from the database
*   @param {string} taskId - The ID of the task to be deleted
*/
export const deleteTask = async (req, res) => {
    const taskId = req.body.taskId;
    try {
        await Task.deleteOne({ taskId });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
*   Get the all tasks unordered
*   @returns {Task[]}
*/
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

/**
*   Add a column to the database
*   @param {string} column - The name of the column to be added
*/
export const addColumn = async (req, res) => {
    const columnData = req; // Assuming columnData contains the necessary properties

    try {
        // Find the last column in the linked list to update its nextColumnId
        const lastColumn = await Column.findOne({ nextColumnId: null }).exec();

        // Create a new column
        const newColumn = new Column(columnData);
        newColumn.id = `col-${Date.now()}`;

        // Update the nextColumnId of the last column and the new column
        if (lastColumn) {
            lastColumn.nextColumnId = newColumn.id;
            newColumn.nextColumnId = null;
            await lastColumn.save();
        } else {
            // If there are no columns, set the new column as the first column
            newColumn.nextColumnId = null; // Assuming it's the first column
        }

        await newColumn.save();

        res.status(201).json(newColumn);
    } catch (error) {
        console.error("Error adding column:", error);
    }
};

/**
*   Delete a column
*   @param {string} id - The ID of the column to be deleted
*/
export const deleteColumn = async (req, res) => {
    const column = req.body;
    try {
        await Column.deleteOne({ id: column.id });
    } catch (error) {
        console.error("Error deleting column:", error.message);
    }
};

/**
*   Update a column's content
*   @param {string} id - The ID of the column to be updated
*/
export const updateColumn = async (req, res) => {
    const column = req.body;
    try {
        await Column.updateOne({ id: column.id }, { ...column });
    } catch (error) {
        console.error("Error updating column:", error.message);
    }
};

/**
*   Get the columns in the order they should be displayed
*   @returns {Column[]} - The columns in the order they should be displayed
*/
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

/**
*   Add a task to a column's taskIds array
*   @param {string} taskId - The ID of the task to be added
*   @param {string} columnId - The ID of the column the task was added to
*/
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

/**
*   Remove a task from a column's taskIds array
*   @param {string} taskId - The ID of the task to be removed
*   @param {string} changedColumnId - The ID of the column the task was removed from
*/
export const removeTaskFromColumn = async (req, res) => {
    const { taskId, changedColumnId } = req.body;
    try {
        const column = await Column.findOne({ id: changedColumnId });
        if (column) {
            // Remove task from column array
            column.taskIds = column.taskIds.filter(id => id !== taskId);
            await column.save();
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
*   Update the taskIds array of a column
*   @param {string} taskId - The ID of the task to be moved
*   @param {string} newColumnId - The ID of the column to move the task to
*   @param {string[]} newColumnTaskIds - The new array of task IDs for the column
*/
export const updateColumnTaskIds = async (req, res) => {
    const { taskId, newColumnId, newColumnTaskIds } = req.body;
    try {
        const column = await Column.findOne({ id: newColumnId });
        if (!column) {
            return
        }

        column.taskIds = newColumnTaskIds;

        const savedColumn = await column.save();
    } catch (error) {
        console.error("Error updating column:", error);
    }
};

export const updateBoard = async (board) => {
    try {
        const { updatedColumns, updatedTasks } = board;
        // Create an array of update operations for columns
        const columnUpdates = updatedColumns.map((column, index) => {
            const nextColumnId = index === updatedColumns.length - 1 ? null : updatedColumns[index + 1].id;
            return {
                updateOne: {
                    filter: { id: column.id },
                    update: { 
                        $set: { 
                            title: column.title,
                            taskIds: column.taskIds,
                            nextColumnId: nextColumnId, 
                        } 
                    }
                }
            };
        });

        // Execute all column updates in a single batch operation
        await Column.bulkWrite(columnUpdates);
        
        // Create an array of update operations for tasks
        const taskUpdates = Object.entries(updatedTasks).map(([id, task]) => {
            return {
                updateOne: {
                    filter: { id: id },
                    update: { $set: task }
                }
            };
        });
        
        // Execute all task updates in a single batch operation
        await Task.bulkWrite(taskUpdates);

    } catch (error) {
        console.error("Error updating columns and tasks:", error.message);
        throw error;  // Propagate the error to the caller
    }
};

/**
 * Save a label to the database.
 * @param {object} req - The HTTP request object containing saved label data.
 * @param {object} res - The HTTP response object.
 * @returns {void}
 */
export const saveLabel = async (req, res) => {
    console.log('Request to save-label endpoint received');
    const labelData = req.body;
    console.log("labelData:", labelData);

    try {
        const newLabel = new Label(labelData);
        await newLabel.save();
        res.status(201).json(newLabel);
    } catch (error) {
        console.error("Error creating label:", error);
        res.status(400).json({ message: "Failed to create label", error: error.message });
    }

};

/**
 * Get all labels from the database.
 * @returns {Label[]} - An array of all labels in the database.
 */
export const getAllLabels = async () => {
    try {
        const labels = await Label.find({});
        return labels;
    } catch (error) {
        throw new Error(`Failed to get labels: ${error.message}`);
    }
};

/**
 * Delete a label from the database
 * @param {object} req - The HTTP request object containing labelId
 * @param {object} res - The HTTP response object.
 * @returns {void}
 */
export const deleteLabel = async (req, res) => {
    console.log("Request to delete-label endpoint received");
    const labelId = req.body.labelId;
    console.log("labelId:", req.body.labelId)
    try {
        await Label.deleteOne({ labelId: labelId }); // Assuming the label ID is stored as _id in MongoDB
        res.status(200).json({ message: 'Label deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Handle PUT request to update a label
 * @param {object} req - The HTTP request object
 * @param {object} res - The HTTP response object
 */
export const updateLabel = async (req, res) => {
    try {
        const updatedLabel = req.body;
        console.log("Updating label...", updatedLabel);

        const label = await Label.findOneAndUpdate(
            { labelId: updatedLabel.labelId },
            updatedLabel,
            { new: true }
        );

        if (!label) {
            return res.status(404).json({ message: "Label not found" });
        }

        res.status(200).json(label);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const addChecklistItem = async (req, res) => {
    const { taskId, checklistItem } = req.body;
    try {
        await Task.updateOne(
            { taskId },
            { $push: { checklist: checklistItem } }
        );
        res.status(200).json({ message: "Checklist item added successfully!" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const deleteChecklistItem = async (req, res) => {
    const { taskId, checklistItemId } = req.body;
    try {
        await Task.updateOne(
            { taskId },
            { $pull: { checklist: { _id: checklistItemId } } }
        );
        res.status(200).json({ message: "Checklist item deleted successfully!" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateChecklistItemStatus = async (req, res) => {
    const { taskId, checklistItemId, isCompleted } = req.body;
    try {
        await Task.updateOne(
            { taskId, "checklist._id": checklistItemId },
            { $set: { "checklist.$.isCompleted": isCompleted } }
        );
        res.status(200).json({ message: "Checklist item status updated successfully!" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
