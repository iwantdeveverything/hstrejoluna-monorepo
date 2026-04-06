import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hstrejoluna | Developer Portfolio",
  description: "Developer resume and projects hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
