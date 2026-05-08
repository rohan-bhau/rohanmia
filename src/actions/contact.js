'use server';

import connectDB from '@/lib/db';
import { Message } from '@/models/Analytics';
import { pusherServer } from '@/lib/pusher';

export async function sendMessage(data) {
  try {
    await connectDB();
    const newMessage = await Message.create(data);

    // Trigger Real-time Notification
    await pusherServer.trigger('admin-notifications', 'new-message', {
      message: `New message from ${data.name}`,
      sender: data.name,
    });

    return { success: true };
  } catch (error) {
    console.error('Send Message Error:', error);
    return { success: false, error: error.message };
  }
}
