import React from 'react';
import { auth } from '@/auth';
import StealthLoginGate from '@/components/admin/StealthLoginGate';
import AdminShell from '@/components/admin/AdminShell';
import Chatbot from '@/components/ai/Chatbot';

export const metadata = {
  title: 'Control Room | Rohan Mia',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ControlRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as any;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = (user?.email as string || '').trim().toLowerCase();
  const isAdmin = 
    Boolean(adminEmail) &&
    user?.role === 'admin' && 
    user?.isAdmin === true && 
    userEmail === adminEmail;

  // Server-only secret path passed into the shell so all links start with secretPath
  const basePath = (process.env.ADMIN_ENTRY_PATH || '').trim();
  if (!basePath) {
    throw new Error('ADMIN_ENTRY_PATH is not configured in environment variables');
  }

  // Fetch admin avatar dynamically from PostgreSQL hero_content
  let avatarUrl = (user?.image as string) || '';
  try {
    const { executeSql } = await import('@/lib/postgres');
    const heroRes = await executeSql<any>(`SELECT profile_image FROM hero_content WHERE id = 'primary' LIMIT 1;`);
    if (heroRes.rows[0]?.profile_image) {
      avatarUrl = heroRes.rows[0].profile_image;
    }
  } catch (err) {
    console.error('Error fetching admin avatar:', err);
  }

  return (
    <>
      {!isAdmin ? (
        <StealthLoginGate />
      ) : (
        <AdminShell basePath={basePath} user={user} avatarUrl={avatarUrl}>
          {children}
        </AdminShell>
      )}
      <Chatbot />
    </>
  );
}
