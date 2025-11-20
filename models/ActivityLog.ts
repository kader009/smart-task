import mongoose, { Schema, model, models } from 'mongoose';

const ActivityLogSchema = new Schema(
  {
    message: { type: String, required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  },
  { timestamps: true }
);

const ActivityLog =
  models.ActivityLog || model('ActivityLog', ActivityLogSchema);
export default ActivityLog;
