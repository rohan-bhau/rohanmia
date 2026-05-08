'use server';

import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
  await connectDB();
  const settings = await Settings.findOne({}) || await Settings.create({
    heroText: "Building modern, high-performance web applications with a focus on clean design and smooth user experiences.",
    typewriterTitles: ["Frontend Developer", "JavaScript Developer", "Next.js Developer"]
  });
  return JSON.parse(JSON.stringify(settings));
}

export async function updateSettings(data) {
  try {
    await connectDB();
    await Settings.findOneAndUpdate({}, data, { upsert: true });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
