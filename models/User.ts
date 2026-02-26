import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

// Delete cached model to prevent stale schema in dev hot-reload
delete mongoose.models.User;
const User = model('User', UserSchema);
export default User;
