import mongoose from '../../db/mongooseConn.mjs';

const labelSchema = new mongoose.Schema({
  labelId: String,
  labelName: String,
  labelColour: String,
});

export default mongoose.model('Label', labelSchema);
 