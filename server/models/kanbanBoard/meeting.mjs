import mongoose from '../../db/mongooseConn.mjs';

const meetingSchema = new mongoose.Schema({
  meetingId: String,
  content: String,
  attendees: String,
  nextMeetingId: String
});

export default mongoose.model('Meeting', meetingSchema);