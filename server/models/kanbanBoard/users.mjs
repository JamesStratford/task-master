import mongoose from 'mongoose';

const userInfoSchema = new mongoose.Schema({
  
  id: String,
  discordId: String,
  username: String,
  accent_color: String,
  avatar: String,
}, { collection: 'user-info' });

export default mongoose.model('UserInfo', userInfoSchema);
