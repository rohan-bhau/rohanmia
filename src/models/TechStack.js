import mongoose from 'mongoose';

const TechStackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, required: true },
  proficiency: { type: Number, min: 0, max: 100, default: 80 },
  isTopSkill: { type: Boolean, default: false },
  color: { type: String, default: '#0ea5e9' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export const TechStack = mongoose.models.TechStack || mongoose.model('TechStack', TechStackSchema);
export default TechStack;
