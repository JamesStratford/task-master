import mongoose from '../../db/mongooseConn.mjs';

const labelSchema = new mongoose.Schema({
  text: String,
  color: String,
});

export default mongoose.model('Label', labelSchema);