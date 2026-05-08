'use server';

import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';

export async function saveLead(data) {
  try {
    await dbConnect();
    const lead = await Lead.create(data);
    return { success: true, lead: JSON.parse(JSON.stringify(lead)) };
  } catch (error) {
    console.error('Save Lead Error:', error);
    return { success: false, error: error.message };
  }
}

export async function getLeads() {
  try {
    await dbConnect();
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(leads));
  } catch (error) {
    console.error('Get Leads Error:', error);
    return [];
  }
}

export async function deleteLead(id) {
  try {
    await dbConnect();
    await Lead.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
