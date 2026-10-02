import AdminClientLayout from "./AdminClientLayout";
import { getHomeContent } from "@/actions/content";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Rohan Mia | Admin",
  description: "Administrative Control Center for Rohan Mia's Portfolio.",
};

export default async function Layout({ children }) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin' || session?.user?.id === 'admin';

  if (!isAdmin) {
    redirect('/login');
  }

  const adminIdentity = await getHomeContent('hero');
  
  return (
    <AdminClientLayout adminIdentity={adminIdentity}>
      {children}
    </AdminClientLayout>
  );
}
