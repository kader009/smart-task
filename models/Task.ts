import mongoose, { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Member', default: null },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Done'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const Task = models.Task || model('Task', TaskSchema);
export default Task;
