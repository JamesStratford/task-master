import mongoose from '../../db/mongooseConn.mjs';

const labelSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Label', labelSchema);