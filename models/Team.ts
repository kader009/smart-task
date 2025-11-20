import mongoose, { Schema, model, models } from 'mongoose';

const TeamSchema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Team = models.Team || model('Team', TeamSchema);
export default Team;
