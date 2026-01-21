import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LeadSignal - Trainiere Meta's Algorithmus auf echte Kunden",
  description: "Weniger Schrott-Leads, mehr echte Kunden. LeadSignal sendet Qualitäts-Feedback an Meta, damit der Algorithmus lernt, Menschen zu finden, die wirklich kaufen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
