import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inflectiv | Data Layer for AI Agents",
  description:
    "The tokenized intelligence marketplace. Upload unstructured data, transform it into structured assets, and trade on the AI data economy.",
  keywords: [
    "AI data",
    "data marketplace",
    "tokenized data",
    "AI agents",
    "structured data",
    "data assets",
    "machine learning data",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts - Vaporwave Theme */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}
