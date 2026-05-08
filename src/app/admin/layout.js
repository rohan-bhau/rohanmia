import AdminClientLayout from "./AdminClientLayout";
import { getHomeContent } from "@/actions/content";

export const metadata = {
  title: "Rohan Mia | Admin",
  description: "Administrative Control Center for Rohan Mia's Portfolio.",
};

export default async function Layout({ children }) {
  const adminIdentity = await getHomeContent('hero');
  
  return (
    <AdminClientLayout adminIdentity={adminIdentity}>
      {children}
    </AdminClientLayout>
  );
}
