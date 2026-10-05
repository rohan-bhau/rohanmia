import React from 'react';
import { auth } from '@/auth';
import StealthLoginGate from '@/components/admin/StealthLoginGate';
import AdminShell from '@/components/admin/AdminShell';

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
  const isAdmin = 
    user?.role === 'admin' && 
    user?.isAdmin === true && 
    user?.email === process.env.ADMIN_EMAIL;

  // If unauthenticated as admin, display stealth login gate directly in-place
  if (!isAdmin) {
    return <StealthLoginGate />;
  }

  // Server-only secret path passed into the shell so all links start with secretPath
  const basePath = process.env.ADMIN_ENTRY_PATH || '/arronhaan1841';

  return (
    <AdminShell basePath={basePath} user={user}>
      {children}
    </AdminShell>
  );
}
