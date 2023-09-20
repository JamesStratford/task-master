import mongoose from '../../db/mongooseConn.mjs';

const taskSchema = new mongoose.Schema({
  id: String,
  content: String,
  column: String,
  description: String
});

export default mongoose.model('Task', taskSchema);
 