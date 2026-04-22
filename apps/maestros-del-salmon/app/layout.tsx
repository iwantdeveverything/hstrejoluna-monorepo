import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FacebookPixel } from "@/components/FacebookPixel";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Maestros del Salmón | Salmón Premium en Cancún",
  description: "Descubre el mejor salmón premium en Cancún. Disfruta de nuestra Doble Garantía: BAP 4-Estrellas y Kosher. Ideal para la alta cocina y los paladares más exigentes.",
  openGraph: {
    title: "Maestros del Salmón | Salmón Premium en Cancún",
    description: "Salmón con Doble Garantía (BAP 4-Estrellas y Kosher). Calidad de alta cocina ahora en tu hogar o restaurante.",
    url: "https://www.maestrosdelsalmon.com",
    siteName: "Maestros del Salmón",
    images: [
      {
        url: "https://www.maestrosdelsalmon.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Salmón Premium Maestros del Salmón",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} text-brand-marine bg-brand-sand min-h-screen flex flex-col`}>
        <FacebookPixel />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
