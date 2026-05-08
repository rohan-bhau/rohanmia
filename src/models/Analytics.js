import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
}, { timestamps: true });

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

const AnalyticsSchema = new mongoose.Schema({
  path: { type: String, required: true },
  visitorId: { type: String },
  device: { type: String },
  browser: { type: String },
  location: { type: String },
  duration: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
