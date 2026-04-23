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

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const t = await getTranslations({ locale, namespace: "salmon.seo" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}`])
      ),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://www.maestrosdelsalmon.com",
      siteName: "Maestros del Salmón",
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: "website",
    },
  };
}
...
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
...
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} text-brand-marine bg-brand-sand min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <FacebookPixel />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
