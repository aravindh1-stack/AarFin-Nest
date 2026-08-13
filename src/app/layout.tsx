import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/ThemeContext";
import PageLoadingOverlay from "@/components/layout/PageLoadingOverlay";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AarFin - Financial Command Center",
  description: "Enterprise SaaS Command Center for Seetu, Vaara Kandhu, and Dhina Kandhu Micro-finance Schemes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <Suspense fallback={null}>
            <PageLoadingOverlay />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
