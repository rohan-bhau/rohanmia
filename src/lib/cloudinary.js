import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadImage(file, folder = 'portfolio') {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(bytes);
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
}
