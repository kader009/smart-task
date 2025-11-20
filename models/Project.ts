import mongoose, { Schema, model, models } from 'mongoose';

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  },
  { timestamps: true }
);

const Project = models.Project || model('Project', ProjectSchema);
export default Project;
