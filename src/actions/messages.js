'use server';

import connectDB from '@/lib/db';
import { Message } from '@/models/Analytics';
import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/admin';

export async function getMessages() {
  try {
    await assertAdmin();
    await connectDB();
    const messages = await Message.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(messages));
  } catch (error) {
    console.error('Get Messages Error:', error);
    return [];
  }
}

export async function deleteMessage(id) {
  try {
    await assertAdmin();
    await connectDB();
    await Message.findByIdAndDelete(id);
    revalidatePath('/admin/messages');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Delete Message Error:', error);
    return { success: false, error: error.message };
  }
}

export async function markMessageAsRead(id) {
  try {
    await assertAdmin();
    await connectDB();
    await Message.findByIdAndUpdate(id, { status: 'read' });
    revalidatePath('/admin/messages');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Mark Message Read Error:', error);
    return { success: false, error: error.message };
  }
}
