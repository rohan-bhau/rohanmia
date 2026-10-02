'use server';

import dbConnect from '@/lib/db';
import Qualification from '@/models/Qualification';
import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/admin';

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
  try {
    await assertAdmin();
    await dbConnect();
    const qualification = await Qualification.create(data);
    revalidatePath('/qualification');
    revalidatePath('/admin');
    return { success: true, data: JSON.parse(JSON.stringify(qualification)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateQualification(id, data) {
  try {
    await assertAdmin();
    await dbConnect();
    const qualification = await Qualification.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/qualification');
    revalidatePath('/admin');
    return { success: true, data: JSON.parse(JSON.stringify(qualification)) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteQualification(id) {
  try {
    await assertAdmin();
    await dbConnect();
    await Qualification.findByIdAndDelete(id);
    revalidatePath('/qualification');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function seedQualifications(items) {
  try {
    await assertAdmin();
    await dbConnect();
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
