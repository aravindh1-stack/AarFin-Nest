import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/page-loader";
import { RouteProgressBar } from "@/components/route-progress-bar";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0D0E" },
  ],
};

export const metadata: Metadata = {
  title: "AarFin Nest | Micro-Finance & Chit-Fund Management OS",
  description:
    "Scale your micro-finance operations with smart oldest-dues-first allocation, scheme batches, and real-time field collection tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans antialiased text-slate-900 bg-[#F8FAFC] dark:bg-[#0C0D0E] dark:text-[#ECEDEE] selection:bg-teal-500/20">
        <ThemeProvider>
          <PageLoader />
          <RouteProgressBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
