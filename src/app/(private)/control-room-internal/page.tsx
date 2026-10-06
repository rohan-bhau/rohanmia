import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ControlRoomRootPage() {
  const basePath = (process.env.ADMIN_ENTRY_PATH || '').trim();
  redirect(`${basePath}/overview`);
}
