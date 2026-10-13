import React from "react";
import { getProjectsDb } from "@/lib/db/projects";
import AdminProjectsManager from "@/components/admin/AdminProjectsManager";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getProjectsDb();

  return <AdminProjectsManager initialProjects={projects} />;
}
