import mongoose, { Schema, model, models } from 'mongoose';

const ActivityLogSchema = new Schema(
  {
    action: { type: String, required: true },
    details: { type: String, required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const ActivityLog =
  models.ActivityLog || model('ActivityLog', ActivityLogSchema);
export default ActivityLog;
