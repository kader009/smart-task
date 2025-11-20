import mongoose, { Schema, model, models } from 'mongoose';

const MemberSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    capacity: { type: Number, required: true, min: 0, max: 5 },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  },
  { timestamps: true }
);

const Member = models.Member || model('Member', MemberSchema);
export default Member;
