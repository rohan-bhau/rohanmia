import AdminClientLayout from "./AdminClientLayout";

export const metadata = {
  title: "Rohan Mia | Admin",
  description: "Administrative Control Center for Rohan Mia's Portfolio.",
};

export default function Layout({ children }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
