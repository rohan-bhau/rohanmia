import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' },
  category: { type: String, enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Cloud'], default: 'Frontend' },
  isTopSkill: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const Skill = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);

const TechStackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, required: true },
  proficiency: { type: Number, min: 0, max: 100 },
}, { timestamps: true });

export const TechStack = mongoose.models.TechStack || mongoose.model('TechStack', TechStackSchema);
