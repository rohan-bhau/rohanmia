import React from 'react';
import { Outfit, Geist_Mono, Newsreader, Instrument_Serif } from "next/font/google";
import "./globals.css";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Providers from "@/components/shared/Providers";
import Background from "@/components/shared/Background";
import { Toaster } from "sonner";
import { getSettings } from "@/actions/settings";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export async function generateMetadata() {
  const settings = await getSettings();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    metadataBase: new URL(baseUrl),
    title: "Rohan Mia",
    description: settings?.siteDescription || "Rohan Mia - Full Stack Developer & Creative Engineer.",
    keywords: settings?.keywords?.split(',').map((k: string) => k.trim()) || ["Portfolio", "Developer"],

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} ${newsreader.variable} ${instrumentSerif.variable} font-sans antialiased`}
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
          <Background />
          <Toaster theme="dark" richColors position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
