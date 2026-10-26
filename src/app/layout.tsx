import React from 'react';
import { Outfit, Geist_Mono, Newsreader, Instrument_Serif } from "next/font/google";
import "./globals.css";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Providers from "@/components/shared/Providers";
import Background from "@/components/shared/Background";
import Preloader from "@/components/shared/Preloader";
import { Toaster } from "sonner";
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

import { buildDynamicMetadata, getBaseSiteUrl } from "@/lib/seo/metadata";
import { getCachedSeoSettings } from "@/lib/publicData";
import {
  generatePersonJsonLd,
  generateWebSiteJsonLd,
  serializeJsonLd,
} from "@/lib/seo/jsonLd";

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/" });
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

  const [seoSettings, { links }] = await Promise.all([
    getCachedSeoSettings().catch(() => null),
    import('@/actions/adminLinks').then(m => m.getPublicLinks()).catch(() => ({ links: [] })),
  ]);

  const activeSocials = (links || []).filter(l => l.active).map(l => l.href);
  const baseUrl = getBaseSiteUrl(seoSettings?.canonical_base_url);

  const personJsonLd = seoSettings
    ? generatePersonJsonLd(seoSettings, baseUrl, activeSocials)
    : null;
  const webSiteJsonLd = seoSettings
    ? generateWebSiteJsonLd(seoSettings, baseUrl)
    : null;

  return (
    <html lang="en" className="dark" data-accent={initialAccent} suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} ${newsreader.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        {personJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeJsonLd(personJsonLd),
            }}
          />
        )}
        {webSiteJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeJsonLd(webSiteJsonLd),
            }}
          />
        )}

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
