import mongoose from 'mongoose';

const AIChatLogSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  lastInteraction: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for performance
AIChatLogSchema.index({ visitorId: 1 });
AIChatLogSchema.index({ lastInteraction: -1 });

export default mongoose.models.AIChatLog || mongoose.model('AIChatLog', AIChatLogSchema, 'aichatlogs');
