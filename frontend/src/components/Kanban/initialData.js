import { Task, Column } from './taskSchema';

const getInitialData = async () => {
  const tasks = await Task.find({});
  const columns = await Column.find({});
  
  const taskMap = {};
  tasks.forEach(task => {
    taskMap[task.id] = task;
  });

  const columnMap = {};
  columns.forEach(column => {
    columnMap[column.id] = column;
  });

  return {
    tasks: taskMap,
    columns: columnMap,
    columnOrder: columns.map(column => column.id) // Assuming you have them ordered in the database
  };
};

const updateData = async (updatedData) => {
  // Update tasks and columns in the MongoDB.
  for (const taskId in updatedData.tasks) {
    await Task.updateOne({ id: taskId }, updatedData.tasks[taskId]);
  }

  for (const columnId in updatedData.columns) {
    await Column.updateOne({ id: columnId }, updatedData.columns[columnId]);
  }
};

export { getInitialData, updateData };
