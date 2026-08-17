import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/page-loader";
import { RouteProgressBar } from "@/components/route-progress-bar";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexFix | Enterprise Micro-Finance & Chit-Fund SaaS OS",
  description:
    "Scale your micro-finance operations with atomic FIFO allocation, multi-scheme engines, and real-time telemetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>
          <PageLoader />
          <RouteProgressBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
