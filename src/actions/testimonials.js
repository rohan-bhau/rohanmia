'use server';

import Testimonial from '@/models/Testimonial';
import connectDB from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getTestimonials(onlyApproved = true) {
  try {
    await connectDB();
    const query = onlyApproved ? { status: 'approved' } : {};
    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(testimonials));
  } catch (error) {
    console.error('Fetch Testimonials Error:', error);
    return [];
  }
}

export async function submitTestimonial(data) {
  try {
    await connectDB();
    const testimonial = await Testimonial.create(data);
    return { success: true, testimonial: JSON.parse(JSON.stringify(testimonial)) };
  } catch (error) {
    console.error('Submit Testimonial Error:', error);
    return { success: false, error: error.message };
  }
}

export async function addTestimonial(data) {
  try {
    await connectDB();
    const testimonial = await Testimonial.create({ ...data, status: 'approved' });
    revalidatePath('/testimonials');
    return { success: true, testimonial: JSON.parse(JSON.stringify(testimonial)) };
  } catch (error) {
    console.error('Add Testimonial Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateTestimonialStatus(id, status) {
  try {
    await connectDB();
    await Testimonial.findByIdAndUpdate(id, { status });
    revalidatePath('/testimonials');
    return { success: true };
  } catch (error) {
    console.error('Update Testimonial Status Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTestimonial(id) {
  try {
    await connectDB();
    await Testimonial.findByIdAndDelete(id);
    revalidatePath('/testimonials');
    return { success: true };
  } catch (error) {
    console.error('Delete Testimonial Error:', error);
    return { success: false, error: error.message };
  }
}
