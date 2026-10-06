import React from 'react';
import { getTechStackDb } from '@/lib/db/stack';
import AdminTechStackManager from '@/components/admin/AdminTechStackManager';

export const dynamic = 'force-dynamic';

export default async function AdminTechStackPage() {
  const categories = await getTechStackDb();

  return <AdminTechStackManager initialCategories={categories} />;
}
