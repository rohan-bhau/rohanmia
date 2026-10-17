import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  const adminSecretPath = (process.env.ADMIN_ENTRY_PATH || '/control-room-internal').replace(/\/+$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [adminSecretPath, '/control-room-internal/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
