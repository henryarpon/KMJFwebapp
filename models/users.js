import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  email_address: String,
  user_type: String,
  salt: String,
  password: String,
  created_at: Date,
  updated_at: Date
});

const User = mongoose.model('User', userSchema);

export default User;
