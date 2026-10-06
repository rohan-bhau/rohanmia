import React from "react";
import Navbar from "@/components/layout/Navbar";
import FloatingControls from "@/components/shared/FloatingControls";
import Chatbot from "@/components/ai/Chatbot";
import ClickBurst from "@/components/shared/ClickBurst";
import Footer from "@/components/layout/Footer";
import { getPublicLinks } from "@/actions/adminLinks";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { socialMap } = await getPublicLinks();

  return (
    <>
      <ClickBurst />
      <Navbar />
      <FloatingControls />
      <Chatbot />
      <main className="relative z-10 min-h-screen">
        {children}
        <Footer socialMap={socialMap} />
      </main>
    </>
  );
}
