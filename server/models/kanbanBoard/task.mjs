import mongoose from '../../db/mongooseConn.mjs';

const taskSchema = new mongoose.Schema({
  taskId: String,
  content: String,
  column: String,
  description: String,
  labels: Array,
  nextTaskId: String
});

export default mongoose.model('Task', taskSchema);
 