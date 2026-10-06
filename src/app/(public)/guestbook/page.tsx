import type { Metadata } from 'next';
import GuestbookClient from './GuestbookClient';
import { getGuestbookData, getOAuthStatus } from '@/lib/guestbook';

export const metadata: Metadata = {
  title: 'Guestbook — Rohan Mia',
  description: 'Leave a note, a kind word, or some feedback on my guestbook wall.',
};

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
