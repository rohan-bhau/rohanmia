import mongoose from 'mongoose';

const QualificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Education', 'Experience', 'Certification'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  accent: {
    type: String,
    enum: ['primary', 'accent'],
    default: 'primary',
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

export default mongoose.models.Qualification || mongoose.model('Qualification', QualificationSchema);
