import mongoose from '../../db/mongooseConn.mjs';

const taskSchema = new mongoose.Schema({
  taskId: String,
  content: String,
  start_date: String,
  due_date: String,
  description: String,
  labels: Array,
  nextTaskId: String
});

export default mongoose.model('Task', taskSchema);
