import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // Short description
  features: [{ type: String }], // Array of strings for bullet points
  image: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Fullstack', 'Frontend', 'Backend', 'Open Source'] 
  },
  techStack: [{ type: String }], // Array of tech names (e.g., "Next.js", "MongoDB")
  liveLink: { type: String, required: true },
  clientLink: { type: String, required: true }, // GitHub Client/Frontend
  serverLink: { type: String }, // Optional GitHub Server/Backend
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
