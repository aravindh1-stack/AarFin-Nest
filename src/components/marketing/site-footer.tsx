export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800/50 dark:text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/nexfix-logo.png"
            alt="NexFix Logo"
            className="h-6 w-auto object-contain"
          />
          <span className="font-bold tracking-tight text-slate-800 dark:text-white">
            NexFix · AarFin Nest
          </span>
        </div>
        <p className="text-xs">
          © {new Date().getFullYear()} NexFix Financial OS. Enterprise Chit-Fund & Micro-Finance System.
        </p>
      </div>
    </footer>
  );
}
