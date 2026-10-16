import React from 'react';
import { Outfit, Geist_Mono, Newsreader, Instrument_Serif } from "next/font/google";
import "./globals.css";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Providers from "@/components/shared/Providers";
import Background from "@/components/shared/Background";
import Preloader from "@/components/shared/Preloader";
import { Toaster } from "sonner";
import { getSettings } from "@/actions/adminSettings";
import { cookies } from "next/headers";
import { AccentColor } from "@/types/theme";

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
    title: settings?.site_title || "MD Rohan Mia | Full-Stack Software Engineer",
    description: settings?.meta_description || "Portfolio of MD Rohan Mia - Full Stack Developer & Creative Engineer.",
    keywords: ["Portfolio", "Full-Stack Developer", "Next.js", "TypeScript", "PostgreSQL"],

    verification: {
      google: "yH9eJO5yYLc4wgh3jwtqR_QE28Vsc1SrST5teq331do",
    },

    icons: {
      icon: [
        { url: "/favicon.png" },
        { url: "/favicon.ico" }
      ],
      shortcut: "/favicon.png",
      apple: "/favicon.png",
    },
    openGraph: {
      title: settings?.site_title || "MD Rohan Mia",
      description: settings?.meta_description || "Full-Stack Developer",
      images: ["/profile.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.site_title || "MD Rohan Mia",
      description: settings?.meta_description || "Full-Stack Developer",
      images: ["/profile.png"],
    },
  };
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieAccent = cookieStore.get('rohan_portfolio_accent')?.value as AccentColor;
  const initialAccent: AccentColor = 
    (cookieAccent && ['cyan', 'violet', 'emerald', 'rose', 'amber', 'mono'].includes(cookieAccent))
      ? cookieAccent
      : 'cyan';

  const [settings, { links }] = await Promise.all([
    getSettings(),
    import('@/actions/adminLinks').then(m => m.getPublicLinks()).catch(() => ({ links: [] })),
  ]);

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  const activeSocials = (links || []).filter(l => l.active).map(l => l.href);

  return (
    <html lang="en" className="dark" data-accent={initialAccent} suppressHydrationWarning>
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
              url: baseUrl,
              image: "/profile.png",
              jobTitle: settings?.site_title?.split('|')[1]?.trim() || "Full-Stack Software Engineer",
              description: settings?.meta_description || "Portfolio of MD Rohan Mia - Full Stack Developer & Creative Engineer.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Dhaka",
                addressCountry: "BD",
              },
              knowsAbout: [
                "React", "Next.js", "Tailwind CSS", "Node.js",
                "TypeScript", "PostgreSQL", "Full-Stack Development",
              ],
              sameAs: activeSocials,
            }),
          }}
        />

        <Providers initialAccent={initialAccent}>
          <Preloader />
          <Background />
          <Toaster theme="dark" richColors position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
