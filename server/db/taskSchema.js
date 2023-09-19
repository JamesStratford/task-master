import mongoose from './mongooseconn.mjs';

const taskSchema = new mongoose.Schema({
  id: String,
  content: String,
  column: String,
  description: String
});

const columnSchema = new mongoose.Schema({
  id: String,
  title: String,
  taskIds: [String]
});

export const Task = mongoose.model('Task', taskSchema);
export const Column = mongoose.model('Column', columnSchema);
 