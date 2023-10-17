import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: String,
  discordId: String,
  username: String,
  accent_color: String,
  avatar: String,
});

export default mongoose.model('User', userSchema);
