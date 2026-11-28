import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/page-loader";
import { RouteProgressBar } from "@/components/route-progress-bar";
import { PwaInstaller } from "@/components/pwa-installer";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#090B0A" },
  ],
};

export const metadata: Metadata = {
  title: "NexFix | Autonomous Financial Operating System",
  description:
    "Next-generation financial operations, multi-branch liquidity tracking, intelligent oldest-dues-first allocation, and real-time field ledger engine.",
  manifest: "/manifest.webmanifest",
  applicationName: "NexFix",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NexFix",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased overflow-x-hidden"
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans antialiased text-slate-900 bg-[#F8FAFC] dark:bg-[#090B0A] dark:text-[#ECEDEE] selection:bg-emerald-500/20 overflow-x-hidden w-full max-w-full">
        <ThemeProvider>
          <PageLoader />
          <RouteProgressBar />
          <PwaInstaller />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
