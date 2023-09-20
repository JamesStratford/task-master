import mongoose from '../../db/mongooseConn.mjs';

const columnSchema = new mongoose.Schema({
    id: String,
    title: String,
    taskIds: [String]
});

export default mongoose.model('Column', columnSchema);