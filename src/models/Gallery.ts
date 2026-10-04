import mongoose, { Document, Model } from 'mongoose';

export interface IGallery extends Document {
  src: string;
  title: string;
  category: string;
  public_id: string;
  position?: 'top' | 'center' | 'bottom';
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new mongoose.Schema<IGallery>({
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
  },
  position: {
    type: String,
    enum: ['top', 'center', 'bottom'],
    default: 'center',
  }
}, { timestamps: true });

const Gallery: Model<IGallery> = mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);

export default Gallery;
