import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Providers from "@/components/shared/Providers";
import Background from "@/components/shared/Background";
import Navbar from "@/components/shared/Navbar";
import FloatingControls from "@/components/shared/FloatingControls";
import Chatbot from "@/components/ai/Chatbot";
import CustomCursor from "@/components/shared/CustomCursor";
import ClickBurst from "@/components/shared/ClickBurst";
import Footer from "@/components/shared/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import connectDB from "@/lib/db";
import Settings from "@/models/Settings";
import { getContactData } from "@/actions/contact";

export async function generateMetadata() {
  await connectDB();
  const settingsDoc = await Settings.findOne({}).sort({ updatedAt: -1 }).lean();
  const settings = JSON.parse(JSON.stringify(settingsDoc));
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    metadataBase: new URL(baseUrl),
    title: "Rohan Mia",
    description: settings?.siteDescription || "Rohan Mia - Full Stack Developer & Creative Engineer.",
    keywords: settings?.keywords?.split(',').map(k => k.trim()) || ["Portfolio", "Developer"],
    icons: {
      icon: settings?.logoUrl || "/favicon.ico",
      shortcut: settings?.logoUrl || "/favicon.ico",
      apple: settings?.logoUrl || "/favicon.ico",
    },
    openGraph: {
      title: settings?.siteName,
      description: settings?.siteDescription,
      images: [settings?.logoUrl || "/profile.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.siteName,
      description: settings?.siteDescription,
      images: [settings?.logoUrl || "/profile.png"],
    },
  };
}

import { Toaster } from "sonner";

export default async function RootLayout({ children }) {
  await connectDB();
  const settingsDoc = await Settings.findOne({}).sort({ updatedAt: -1 }).lean();
  const settings = JSON.parse(JSON.stringify(settingsDoc));
  const contactData = await getContactData();
  console.log('--- ROOT LAYOUT DB FETCH ---', { id: settings?._id, logo: settings?.logoUrl });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <CustomCursor />
          <ClickBurst />
          <Background />
          <Navbar settings={settings} />
          <FloatingControls />
          <Chatbot />
          <Toaster theme="dark" richColors position="top-right" />
          <main className="relative z-10 min-h-screen">
            {children}
            <Footer contactData={contactData} settings={settings} />
          </main>
        </Providers>
      </body>
    </html>
  );
}
