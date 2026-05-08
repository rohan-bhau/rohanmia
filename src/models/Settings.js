import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Antigravity' },
  siteDescription: { type: String, default: 'Premium Developer Portfolio' },
  logoUrl: { type: String },
  logoPublicId: { type: String },
  keywords: { type: String, default: 'Portfolio, Developer, Fullstack' },
  contactEmail: { type: String },
  footerText: { type: String, default: 'Built with passion and premium architecture.' },
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
