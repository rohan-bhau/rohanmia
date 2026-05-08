export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rohanmia.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
