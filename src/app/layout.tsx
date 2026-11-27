import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PageLoader } from "@/components/page-loader";
import { RouteProgressBar } from "@/components/route-progress-bar";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-urbanist",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark h-full antialiased overflow-x-hidden ${urbanist.variable}`}
      suppressHydrationWarning
    >
      <body className={`min-h-full ${urbanist.className} antialiased text-slate-900 bg-[#F8FAFC] dark:bg-[#090B0A] dark:text-[#ECEDEE] selection:bg-emerald-500/20 overflow-x-hidden w-full max-w-full`}>
        <ThemeProvider>
          <PageLoader />
          <RouteProgressBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
