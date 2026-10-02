import { auth } from '@/auth';

export async function assertAdmin() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin' || session?.user?.id === 'admin';
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required.');
  }
  return session;
}

export async function isAdminSession() {
  try {
    const session = await auth();
    return session?.user?.role === 'admin' || session?.user?.id === 'admin';
  } catch {
    return false;
  }
}
