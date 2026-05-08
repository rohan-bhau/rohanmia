import mongoose from 'mongoose';

const HomeContentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true, // e.g., "hero", "about"
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.HomeContent || mongoose.model('HomeContent', HomeContentSchema);
