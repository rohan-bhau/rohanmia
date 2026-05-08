import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  email: { type: String, default: 'rohan@example.com' },
  phone: { type: String, default: '+880 1234 567890' },
  address: { type: String, default: 'Dhaka, Bangladesh' },
  socials: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String } // Key for identifying the icon component
  }]
}, { timestamps: true });

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
