import { Schema, model } from 'mongoose';

const MeetingSchema = new Schema({
  title: { type: String, required: true },
  rawNotes: { type: String, required: true },
  aiSummary: {
    overview: { type: String, default: '' },
    keyHighlights: [{ type: String }],
    actionItems: [{ type: String }],
    productivityInsights: { type: String, default: '' }
  },
  followUpEmail: { type: String, default: '' },
  tags: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, {
  timestamps: true
});

// Explicit indexes to optimize search and filter queries
MeetingSchema.index({ tags: 1 });
MeetingSchema.index({ title: 'text' });

// Compound indexes for user search and filtering flows
MeetingSchema.index({ createdBy: 1, tags: 1 });
MeetingSchema.index({ createdBy: 1, title: 1 });

export const Meeting = model('Meeting', MeetingSchema);

