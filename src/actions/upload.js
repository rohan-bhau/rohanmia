'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(formData) {
  try {
    const file = formData.get('file');
    if (!file) throw new Error('No file provided');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'portfolio_cms' },
        (error, result) => {
          if (error) reject(error);
          else resolve({ success: true, url: result.secure_url });
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, error: error.message };
  }
}
