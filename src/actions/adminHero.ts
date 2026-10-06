'use server';

import { executeSql, escapeSqlString, escapeSqlJson } from '@/lib/postgres';
import { ensurePortfolioTables } from '@/lib/db/schema';
import { assertAdmin } from '@/lib/admin';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import { HeroData } from '@/lib/constants/homepage';

/**
 * Fetch Hero Data from PostgreSQL
 */
export async function getHeroData(): Promise<HeroData> {
  try {
    await ensurePortfolioTables();
    const res = await executeSql<any>(
      `SELECT * FROM hero_content WHERE id = 'primary' LIMIT 1;`
    );

    if (res.rows.length === 0) {
      return {
        greeting: '',
        name: '',
        surname: '',
        bio: '',
        profile_image: '',
        resume_url: '',
        rotating_roles: [],
        projects_cta_text: 'View Projects',
        resume_cta_text: 'View Resume',
      };
    }

    const row = res.rows[0];
    const statsObj = typeof row.stats === 'object' && row.stats !== null ? row.stats : {};

    return {
      greeting: row.greeting || '',
      name: row.name || '',
      surname: row.surname || '',
      bio: row.bio || '',
      profile_image: row.profile_image || '',
      resume_url: row.resume_url || '',
      rotating_roles: Array.isArray(row.rotating_roles) ? row.rotating_roles : [],
      projects_cta_text: statsObj.projects_cta_text || 'View Projects',
      resume_cta_text: statsObj.resume_cta_text || 'View Resume',
    };
  } catch (error) {
    console.error('getHeroData error:', error);
    return {
      greeting: '',
      name: '',
      surname: '',
      bio: '',
      profile_image: '',
      resume_url: '',
      rotating_roles: [],
      projects_cta_text: 'View Projects',
      resume_cta_text: 'View Resume',
    };
  }
}

/**
 * Save updated Hero Data to PostgreSQL
 */
export async function saveHeroData(data: Partial<HeroData>) {
  try {
    await assertAdmin();
    await ensurePortfolioTables();

    // Strict read: if the current row cannot be loaded, abort instead of
    // merging into empty values (which would wipe existing data).
    const curRes = await executeSql<any>(`SELECT * FROM hero_content WHERE id = 'primary' LIMIT 1;`);
    const row = curRes.rows[0] || {};
    const statsObj = typeof row.stats === 'object' && row.stats !== null ? row.stats : {};
    const current: HeroData = {
      greeting: row.greeting || '',
      name: row.name || '',
      surname: row.surname || '',
      bio: row.bio || '',
      profile_image: row.profile_image || '',
      resume_url: row.resume_url || '',
      rotating_roles: Array.isArray(row.rotating_roles) ? row.rotating_roles : [],
      projects_cta_text: statsObj.projects_cta_text || '',
      resume_cta_text: statsObj.resume_cta_text || '',
    };
    const updated: HeroData = {
      ...current,
      ...data,
    };

    const query = `
      INSERT INTO hero_content (
        id, greeting, name, surname, bio, profile_image, resume_url, rotating_roles, stats, updated_at
      ) VALUES (
        'primary',
        ${escapeSqlString(updated.greeting)},
        ${escapeSqlString(updated.name)},
        ${escapeSqlString(updated.surname)},
        ${escapeSqlString(updated.bio)},
        ${escapeSqlString(updated.profile_image)},
        ${escapeSqlString(updated.resume_url)},
        ${escapeSqlJson(updated.rotating_roles)},
        ${escapeSqlJson({
          projects_cta_text: updated.projects_cta_text,
          resume_cta_text: updated.resume_cta_text
        })},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        greeting = EXCLUDED.greeting,
        name = EXCLUDED.name,
        surname = EXCLUDED.surname,
        bio = EXCLUDED.bio,
        profile_image = EXCLUDED.profile_image,
        resume_url = EXCLUDED.resume_url,
        rotating_roles = EXCLUDED.rotating_roles,
        stats = EXCLUDED.stats,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    await executeSql(query);
    revalidatePath('/');
    revalidatePath('/control-room-internal');
    return { success: true, hero: updated };
  } catch (error: any) {
    console.error('saveHeroData error:', error);
    return { success: false, error: error.message || 'Failed to save hero content' };
  }
}

/**
 * Upload cropped hero profile image to Cloudinary and update PostgreSQL
 */
export async function uploadHeroProfileImage(formData: FormData) {
  try {
    await assertAdmin();
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('No image file provided');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await new Promise<{ url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'portfolio_cms',
          transformation: [
            { width: 900, height: 900, crop: 'fill', gravity: 'face' },
            { quality: 'auto:best', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error || !result) reject(error || new Error('Cloudinary upload failed'));
          else resolve({ url: result.secure_url, public_id: result.public_id });
        }
      ).end(buffer);
    });

    // Update in database
    await saveHeroData({ profile_image: uploadRes.url });

    revalidatePath('/');
    revalidatePath('/control-room-internal');
    return { success: true, url: uploadRes.url };
  } catch (error: any) {
    console.error('uploadHeroProfileImage error:', error);
    return { success: false, error: error.message || 'Upload failed' };
  }
}
