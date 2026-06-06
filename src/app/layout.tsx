import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoinAtlas",
  description: "Self-hosted personal coin collection manager with OCR-assisted identification."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
