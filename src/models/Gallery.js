import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
  src: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  }
}, { timestamps: true });

export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);
