import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
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

import { getSettings } from "@/actions/settings";
import { getContactData } from "@/actions/contact";

export async function generateMetadata() {
  const settings = await getSettings();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    metadataBase: new URL(baseUrl),
    title: settings?.seo?.title || "Rohan Mia | Full Stack Developer",
    description: settings?.seo?.description || "Futuristic developer portfolio showcasing modern web applications.",
    openGraph: {
      title: settings?.seo?.title,
      description: settings?.seo?.description,
      images: [settings?.seo?.ogImage || "/profile.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.seo?.title,
      description: settings?.seo?.description,
      images: [settings?.seo?.ogImage || "/profile.png"],
    },
  };
}

import { Toaster } from "sonner";

export default async function RootLayout({ children }) {
  const contactData = await getContactData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>
          <CustomCursor />
          <ClickBurst />
          <Background />
          <Navbar />
          <FloatingControls />
          <Chatbot />
          <Toaster theme="dark" richColors position="top-right" />
          <main className="relative z-10 min-h-screen">
            {children}
            <Footer contactData={contactData} />
          </main>
        </Providers>
      </body>
    </html>
  );
}
