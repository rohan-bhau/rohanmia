'use server';

import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { revalidatePath } from 'next/cache';

import { unstable_noStore as noStore } from 'next/cache';

export async function getSettings() {
  noStore();
  try {
    await connectDB();
    const allSettings = await Settings.find({}).sort({ updatedAt: -1 });
    
    if (allSettings.length === 0) {
      const newSettings = await Settings.create({
        siteName: 'Antigravity',
        siteDescription: 'Premium Developer Portfolio',
        keywords: 'Portfolio, Developer, Fullstack'
      });
      return JSON.parse(JSON.stringify(newSettings));
    }

    const [latest, ...others] = allSettings;
    if (others.length > 0) {
      await Settings.deleteMany({ _id: { $in: others.map(o => o._id) } });
    }
    console.log('--- FETCHING SETTINGS ---', { id: latest._id, logo: latest.logoUrl });
    return JSON.parse(JSON.stringify(latest));
  } catch (error) {
    console.error('Fetch Settings Error:', error);
    return null;
  }
}

export async function updateSettings(data) {
  try {
    await connectDB();
    
    // Explicitly map fields to ensure they are saved according to the schema
    const updateData = {
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      keywords: data.keywords,
      contactEmail: data.contactEmail,
      logoUrl: data.logoUrl,
      logoPublicId: data.logoPublicId,
      footerText: data.footerText,
      maintenanceMode: data.maintenanceMode
    };

    console.log('--- SAVING SETTINGS ---', { name: updateData.siteName, hasLogo: !!updateData.logoUrl });

    const settings = await Settings.findOneAndUpdate({}, { $set: updateData }, { 
      upsert: true, 
      new: true, 
      sort: { updatedAt: -1 } 
    });
    
    revalidatePath('/', 'layout');
    return { success: true, data: JSON.parse(JSON.stringify(settings)) };
  } catch (error) {
    console.error('Update Settings Error:', error);
    return { success: false, error: error.message };
  }
}
