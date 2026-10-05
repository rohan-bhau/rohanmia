'use server';

import { assertAdmin } from '@/lib/admin';
import { getGalleryPhotosDb, insertGalleryPhotoDb, updateGalleryPhotoDb, deleteGalleryPhotoDb, DbGalleryPhotoRow } from '@/lib/db/gallery';
import { revalidatePath } from 'next/cache';

/**
 * Public Server Action to fetch gallery images from PostgreSQL
 */
export async function getGalleryImages(): Promise<DbGalleryPhotoRow[]> {
  try {
    return await getGalleryPhotosDb();
  } catch (err) {
    console.error('getGalleryImages error:', err);
    return [];
  }
}

export async function fetchAdminGallery(): Promise<{ success: boolean; photos?: DbGalleryPhotoRow[]; error?: string }> {
  try {
    await assertAdmin();
    const photos = await getGalleryPhotosDb();
    return { success: true, photos };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveAdminGalleryPhoto(data: {
  id?: string;
  src: string;
  title: string;
  category: string;
  caption?: string;
  date?: string;
  position?: string;
  sort_order?: number;
}): Promise<{ success: boolean; photo?: DbGalleryPhotoRow; error?: string }> {
  try {
    await assertAdmin();
    if (!data.src?.trim() || !data.title?.trim()) {
      return { success: false, error: 'Photo URL and Title are required.' };
    }

    let photo: DbGalleryPhotoRow;
    if (data.id) {
      const updated = await updateGalleryPhotoDb(data.id, data);
      if (!updated) return { success: false, error: 'Photo not found to update.' };
      photo = updated;
    } else {
      photo = await insertGalleryPhotoDb(data);
    }

    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true, photo };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeAdminGalleryPhoto(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();
    const deleted = await deleteGalleryPhotoDb(id);
    if (!deleted) return { success: false, error: 'Failed to delete photo.' };

    revalidatePath('/gallery');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
