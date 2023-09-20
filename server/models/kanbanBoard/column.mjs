import mongoose from '../../db/mongooseConn.mjs';

const columnSchema = new mongoose.Schema({
    id: String,
    title: String,
    firstTaskId: String,
    taskIds: [String],
    nextColumnId: String
});

export default mongoose.model('Column', columnSchema);