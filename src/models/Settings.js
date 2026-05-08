import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  logo: { type: String },
  heroText: { type: String },
  typewriterTitles: [{ type: String }],
  profileImage: { type: String },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    instagram: String,
    facebook: String,
  },
  contactEmail: { type: String },
  resumeUrl: { type: String },
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String,
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
