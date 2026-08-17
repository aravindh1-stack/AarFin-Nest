export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-800/50 dark:text-slate-400">
      <p>
        © {new Date().getFullYear()} NexFix. Enterprise Micro-Finance SaaS OS.
      </p>
    </footer>
  );
}
