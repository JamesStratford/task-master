import mongoose from '../../db/mongooseConn.mjs';

const labelSchema = new mongoose.Schema({
  labelId: Number,
  text: String,
  color: String,
});

export default mongoose.model('Label', labelSchema);