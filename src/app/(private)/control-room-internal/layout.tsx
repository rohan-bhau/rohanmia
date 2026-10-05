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
  const basePath = process.env.ADMIN_ENTRY_PATH || '/arronhaan1841';

  return (
    <>
      {!isAdmin ? (
        <StealthLoginGate />
      ) : (
        <AdminShell basePath={basePath} user={user}>
          {children}
        </AdminShell>
      )}
      <Chatbot />
    </>
  );
}
