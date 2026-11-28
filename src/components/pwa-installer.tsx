"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, WifiOff, CheckCircle2, Share2, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker active with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // 2. Detect Standalone Display Mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(isStandaloneMode));
    };
    checkStandalone();

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
    setIsIos(isIosDevice && isSafari);

    // 4. Capture beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user dismissed recently
      const dismissedUntil = localStorage.getItem("nexfix_pwa_dismissed");
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 5. Offline / Online Connectivity Listeners
    const handleOffline = () => {
      setIsOffline(true);
    };
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 3500);
      return () => clearTimeout(timer);
    };

    // 6. Custom Trigger to Open Install Prompt from UI
    const handleExternalTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt().then(() => {
          deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === "accepted") {
              setShowInstallBanner(false);
            }
          });
        });
      } else {
        setShowIosGuide(true);
      }
    };

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("offline", handleOffline);
      window.addEventListener("online", handleOnline);
      window.addEventListener("nexfix:open-install-prompt", handleExternalTrigger);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("nexfix:open-install-prompt", handleExternalTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Dismiss for 3 days
    localStorage.setItem("nexfix_pwa_dismissed", String(Date.now() + 3 * 24 * 60 * 60 * 1000));
  };

  // If already running as an installed standalone app, only show offline/online toasts
  return (
    <>
      {/* Offline Alert Bar */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 py-1.5 px-3 text-xs font-semibold text-black shadow-md transition-all">
          <WifiOff className="h-3.5 w-3.5 shrink-0 animate-pulse" />
          <span>Offline Mode • Showing cached records. Live syncing resumes upon reconnection.</span>
        </div>
      )}

      {/* Online Restored Toast */}
      {showOnlineToast && !isOffline && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#0E1110] py-2 px-3.5 text-xs font-semibold text-emerald-400 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Connection restored • Synchronized with live ledger</span>
        </div>
      )}

      {/* Mobile Install App Floating Banner */}
      {!isStandalone && (showInstallBanner || (isIos && !showIosGuide)) && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 rounded-2xl border border-emerald-500/30 bg-[#0E1110]/95 p-3.5 shadow-2xl backdrop-blur-xl dark:border-[#1F2623] animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-emerald-500/30 bg-black p-1 shadow-inner">
              <Image
                src="/nexfix.png"
                alt="NexFix Icon"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Install NexFix Mobile App
                </h4>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg p-1 text-neutral-400 hover:text-white transition"
                  aria-label="Close install banner"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-400 leading-tight">
                Install as a standalone app for fast 1-tap launch, offline receipts & full-screen field operations.
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-emerald-400 active:scale-95 shadow-xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isIos ? "Add to Home Screen" : "Install App"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg border border-neutral-700/60 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-[#1F2623] bg-[#0E1110] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Download className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-neutral-300 leading-relaxed">
              To install NexFix on iOS without App Store:
            </p>

            <ol className="mt-3 space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button <Share2 className="inline h-3.5 w-3.5 text-sky-400 mx-0.5" /> at the bottom of Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                  2
                </span>
                <span>
                  Scroll down and select <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="inline h-3.5 w-3.5 text-emerald-400 mx-0.5" />.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">Add</strong> in the top-right corner to launch from your home screen.
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="mt-5 w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-black transition hover:bg-emerald-400 active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
