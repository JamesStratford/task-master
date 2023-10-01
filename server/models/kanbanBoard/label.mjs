import mongoose from '../../db/mongooseConn.mjs';

const labelSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false,
  },
  color: {
    type: String,
    required: false,
  },
});

export default mongoose.model('Label', labelSchema);