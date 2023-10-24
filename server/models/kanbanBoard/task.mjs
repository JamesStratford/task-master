import mongoose from '../../db/mongooseConn.mjs';

const checklistItemSchema = new mongoose.Schema({
  description: String,
  isCompleted: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
  taskId: String,
  content: String,
  startDate: String,
  dueDate: String,
  description: String,
  labels: Array,
  nextTaskId: String,
  assignedUser: String,
  checklist: [checklistItemSchema] 
});

export default mongoose.model('Task', taskSchema);
