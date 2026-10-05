import React from 'react';
import Navbar from "@/components/layout/Navbar";
import FloatingControls from "@/components/shared/FloatingControls";
import Chatbot from "@/components/ai/Chatbot";
import ClickBurst from "@/components/shared/ClickBurst";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/shared/Preloader";
import { getSettings } from "@/actions/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <Preloader />
      <ClickBurst />
      <Navbar settings={settings} />
      <FloatingControls />
      <Chatbot />
      <main className="relative z-10 min-h-screen">
        {children}
        <Footer />
      </main>
    </>
  );
}
