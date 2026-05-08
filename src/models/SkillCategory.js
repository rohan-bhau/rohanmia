import mongoose from 'mongoose';

const SkillCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true }, // Lucide icon name
  skills: [{
    name: { type: String, required: true },
    level: { type: Number, required: true, min: 0, max: 100 },
    icon: { type: String, required: true } // React Icon ID
  }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.SkillCategory || mongoose.model('SkillCategory', SkillCategorySchema);
