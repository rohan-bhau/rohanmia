import { auth } from '@/auth';

export async function assertAdmin() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const user = session?.user as any;
  const userEmail = (user?.email as string || '').trim().toLowerCase();

  const isVerifiedAdmin = 
    Boolean(adminEmail) &&
    user?.role === 'admin' && 
    user?.isAdmin === true && 
    userEmail === adminEmail;

  if (!isVerifiedAdmin) {
    throw new Error('Unauthorized: Admin access required.');
  }
  return session;
}

export async function isAdminSession() {
  try {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const user = session?.user as any;
    const userEmail = (user?.email as string || '').trim().toLowerCase();

    return (
      Boolean(adminEmail) &&
      user?.role === 'admin' && 
      user?.isAdmin === true && 
      userEmail === adminEmail
    );
  } catch {
    return false;
  }
}
