import mongoose from '../../db/mongooseConn.mjs';

const labelSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false,
  },
  color: {
    type: String,
    required: false,
    default: '#ff0000', // Red by default
  },
});

export default mongoose.model('Label', labelSchema);