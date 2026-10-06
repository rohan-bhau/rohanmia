import React from 'react';
import Navbar from "@/components/layout/Navbar";
import FloatingControls from "@/components/shared/FloatingControls";
import Chatbot from "@/components/ai/Chatbot";
import ClickBurst from "@/components/shared/ClickBurst";
import Footer from "@/components/layout/Footer";
import { getSettings } from "@/actions/adminSettings";
import { getPublicLinks } from "@/actions/adminLinks";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, { socialMap }] = await Promise.all([
    getSettings(),
    getPublicLinks()
  ]);

  return (
    <>
      <ClickBurst />
      <Navbar settings={settings} />
      <FloatingControls />
      <Chatbot />
      <main className="relative z-10 min-h-screen">
        {children}
        <Footer socialMap={socialMap} />
      </main>
    </>
  );
}
