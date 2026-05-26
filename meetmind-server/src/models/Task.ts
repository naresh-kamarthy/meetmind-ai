import { Schema, model } from 'mongoose';

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date },
  status: { type: String, enum: ['Todo', 'In Progress', 'Completed'], default: 'Todo', index: true },
  linkedMeeting: { type: Schema.Types.ObjectId, ref: 'Meeting', default: null, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedUser: { type: Schema.Types.ObjectId, ref: 'User', index: true }
}, {
  timestamps: true
});

// Explicit indexes to optimize querying and filtering
TaskSchema.index({ title: 'text' });

// Compound indexes to cover typical Kanban task search and filter combinations
TaskSchema.index({ createdBy: 1, status: 1 });
TaskSchema.index({ createdBy: 1, priority: 1 });
TaskSchema.index({ createdBy: 1, linkedMeeting: 1 });
TaskSchema.index({ createdBy: 1, title: 1 });

export const Task = model('Task', TaskSchema);
