import mongoose from '../../db/mongooseConn.mjs';

const checklistItemSchema = new mongoose.Schema({
  description: String,
  isCompleted: Boolean
});


const taskSchema = new mongoose.Schema({
  taskId: String,
  content: String,
  due_date: String,
  description: String,
  labels: Array,
  nextTaskId: String,
  checklist: [checklistItemSchema] 
});

export default mongoose.model('Task', taskSchema);
