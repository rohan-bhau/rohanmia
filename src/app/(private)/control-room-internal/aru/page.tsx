import React from "react";
import { getAruAdminPanelData } from "@/actions/aiAdmin";
import AruManagementClient from "@/components/admin/AruManagementClient";

export const dynamic = "force-dynamic";

export default async function AruControlRoomPage() {
  const data = await getAruAdminPanelData();
  const basePath = (process.env.ADMIN_ENTRY_PATH || "").trim();

  return <AruManagementClient initialData={data} basePath={basePath} />;
}
