import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 5,
  },
  image: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending',
  }
}, { timestamps: true });

export default mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
