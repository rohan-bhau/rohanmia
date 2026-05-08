'use server';

import connectDB from '@/lib/db';
import { Message } from '@/models/Analytics';
import Contact from '@/models/Contact';
import { pusherServer } from '@/lib/pusher';
import { revalidatePath } from 'next/cache';

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

export async function getContactData() {
  try {
    await connectDB();
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create({
        email: 'rohan@example.com',
        phone: '+880 1234 567890',
        address: 'Dhaka, Bangladesh',
        socials: [
          { name: 'Github', url: 'https://github.com' },
          { name: 'Linkedin', url: 'https://linkedin.com' },
          { name: 'Twitter', url: 'https://twitter.com' }
        ]
      });
    }
    return JSON.parse(JSON.stringify(contact));
  } catch (error) {
    console.error('Get Contact Error:', error);
    return null;
  }
}

export async function updateContactData(data) {
  try {
    await connectDB();
    const contact = await Contact.findOneAndUpdate({}, data, { upsert: true, new: true });
    revalidatePath('/contact');
    revalidatePath('/');
    return { success: true, data: JSON.parse(JSON.stringify(contact)) };
  } catch (error) {
    console.error('Update Contact Error:', error);
    return { success: false, error: error.message };
  }
}
