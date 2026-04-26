import { Inter } from "next/font/google";

import "../globals.css";
import { FacebookPixel } from "@/components/FacebookPixel";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { locales, type Locale, isValidLocale } from '@hstrejoluna/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.maestrosdelsalmon.com";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const t = await getTranslations({ locale, namespace: "salmon.seo" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}`])
      ),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${BASE_URL}/${locale}`,
      siteName: "Maestros del Salmón",
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: "website",
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Maestros del Salmón",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }
  const [messages, tCommon] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Maestros del Salmón",
    url: BASE_URL,
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} text-brand-marine bg-brand-sand min-h-screen flex flex-col`}>
        <a href="#main" className="sr-only focus:not-sr-only">{tCommon('skip_to_content')}</a>
        <NextIntlClientProvider messages={messages}>
          <FacebookPixel />
          <main id="main" className="flex-grow">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}