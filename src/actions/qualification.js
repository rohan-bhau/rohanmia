'use server';

import dbConnect from '@/lib/db';
import Qualification from '@/models/Qualification';
import { revalidatePath } from 'next/cache';

export async function getQualifications() {
  await dbConnect();
  try {
    const qualifications = await Qualification.find({}).sort({ order: 1, createdAt: -1 });
    return JSON.parse(JSON.stringify(qualifications));
  } catch (error) {
    return [];
  }
}

export async function addQualification(data) {
  await dbConnect();
  try {
    const qualification = await Qualification.create(data);
    revalidatePath('/qualification');
    revalidatePath('/admin');
    return { success: true, data: JSON.parse(JSON.stringify(qualification)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateQualification(id, data) {
  await dbConnect();
  try {
    const qualification = await Qualification.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/qualification');
    revalidatePath('/admin');
    return { success: true, data: JSON.parse(JSON.stringify(qualification)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteQualification(id) {
  await dbConnect();
  try {
    await Qualification.findByIdAndDelete(id);
    revalidatePath('/qualification');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function seedQualifications(items) {
  await dbConnect();
  try {
    for (const item of items) {
      await Qualification.findOneAndUpdate(
        { title: item.title, subtitle: item.subtitle },
        item,
        { upsert: true }
      );
    }
    revalidatePath('/qualification');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
