import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "../globals.css";

import Footer from "../../components/fragments/Footer";
import CookieBanner from "../../components/fragments/CookieBanner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { isValidLocale } from '@hstrejoluna/i18n';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

async function SkipToContent() {
  const t = await getTranslations("common");
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-ember focus:text-void focus:font-mono focus:font-bold focus:uppercase focus:outline-none"
    >
      {t("skip_to_content")}
    </a>
  );
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SkipToContent />
          <div className="relative min-h-screen flex flex-col">
            <main id="main-content" className="flex-grow">{children}</main>
            <Footer />
          </div>
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
