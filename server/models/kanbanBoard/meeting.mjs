import mongoose from '../../db/mongooseConn.mjs';

const meetingSchema = new mongoose.Schema({
  meetingId: String,
  content: String,
  attendees: String,
  nextMeetingId: String
});

const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;