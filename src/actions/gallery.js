'use server';

import Gallery from '@/models/Gallery';
import connectDB from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { deleteImage } from './upload';

export async function getGalleryImages() {
  try {
    await connectDB();
    const images = await Gallery.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(images));
  } catch (error) {
    console.error('Fetch Gallery Error:', error);
    return [];
  }
}

export async function addGalleryImage(data) {
  try {
    await connectDB();
    const newImage = await Gallery.create(data);
    revalidatePath('/gallery');
    return { success: true, image: JSON.parse(JSON.stringify(newImage)) };
  } catch (error) {
    console.error('Add Gallery Image Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateGalleryImage(id, data) {
  try {
    await connectDB();
    await Gallery.findByIdAndUpdate(id, data);
    revalidatePath('/gallery');
    return { success: true };
  } catch (error) {
    console.error('Update Gallery Image Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteGalleryImage(id, public_id) {
  try {
    await connectDB();
    
    // Delete from Cloudinary
    if (public_id) {
      await deleteImage(public_id);
    }
    
    // Delete from DB
    await Gallery.findByIdAndDelete(id);
    
    revalidatePath('/gallery');
    return { success: true };
  } catch (error) {
    console.error('Delete Gallery Image Error:', error);
    return { success: false, error: error.message };
  }
}
