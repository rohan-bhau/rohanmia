import React from 'react';
import { getOverviewAnalytics } from '@/actions/adminOverview';
import ControlRoomOverviewClient from '@/components/admin/ControlRoomOverviewClient';

export const dynamic = 'force-dynamic';

export default async function ControlRoomOverviewPage() {
  const data = await getOverviewAnalytics();
  const basePath = (process.env.ADMIN_ENTRY_PATH || '').trim();

  return (
    <ControlRoomOverviewClient basePath={basePath} data={data} />
  );
}
