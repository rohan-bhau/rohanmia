import { buildDynamicMetadata } from '@/lib/seo/metadata';
import GuestbookClient from './GuestbookClient';
import { getGuestbookData, getOAuthStatus } from '@/lib/guestbook';

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/guestbook" });
}

export default async function GuestbookPage() {
  // Load entries on the server so they are already in the HTML on first paint
  let data: Awaited<ReturnType<typeof getGuestbookData>>;
  try {
    data = await getGuestbookData();
  } catch (error) {
    console.error('Guestbook SSR load error:', (error as Error).message);
    data = { entries: [], oauthConfigured: getOAuthStatus() };
  }

  return (
    <GuestbookClient
      initialEntries={data.entries}
      initialOauthConfigured={data.oauthConfigured}
    />
  );
}
