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
import Preloader from "@/components/shared/Preloader";

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
    title: "Rohan Mia",
    description: settings?.siteDescription || "Rohan Mia - Full Stack Developer & Creative Engineer.",
    keywords: settings?.keywords?.split(',').map(k => k.trim()) || ["Portfolio", "Developer"],

    verification: {
      google: "yH9eJO5yYLc4wgh3jwtqR_QE28Vsc1SrST5teq331do",
    },

    icons: {
      icon: [
        { url: "/favicon.png" },
        { url: settings?.logoUrl || "/favicon.ico" }
      ],
      shortcut: "/favicon.png",
      apple: "/favicon.png",
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
  const settings = await getSettings();
  const contactData = await getContactData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "MD Rohan Mia",
              alternateName: ["Rohan Bhau", "Rohan Mia", "rohan-bhau"],
              url: "https://rohanmia.vercel.app",
              image: "https://res.cloudinary.com/dzni0yyle/image/upload/v1778155735/portfolio_cms/fcprc2kqkcmxitdibzcn.png",
              jobTitle: "Frontend & MERN Stack Developer",
              description: "MD Rohan Mia, also known as Rohan Bhau, is a Frontend and MERN Stack Developer from Dhaka, Bangladesh. Specializing in React, Next.js, Tailwind CSS, Node.js, and MongoDB.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Dhaka",
                addressCountry: "BD",
              },
              knowsAbout: [
                "React", "Next.js", "Tailwind CSS", "Node.js",
                "MongoDB", "Express.js", "Figma", "REST API",
                "HTML", "Frontend Development", "MERN Stack",
              ],
              sameAs: [
                "https://www.linkedin.com/in/rohan-mia/",
                "https://www.facebook.com/bhau.rohan",
                "https://www.instagram.com/__rohan.bhau/",
                "https://x.com/_Rohan_Bhau",
                "https://github.com/rohan-bhau",
              ],
            }),
          }}
        />

        <Providers>
          <Preloader />
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