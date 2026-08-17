export function DashboardTopbar({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-slate-50/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-slate-800/50 dark:bg-[#000000]/80">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 3.55 9.7l3.13 3.12a.75.75 0 1 0 1.06-1.06l-3.12-3.13A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Search members, routes..."
            className="w-64 rounded-lg border border-slate-200/80 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800/50 dark:bg-[#121212] dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-800/50 dark:bg-[#121212] dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:text-teal-300"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10 2a6 6 0 0 0-6 6v2.6c0 .5-.2 1-.5 1.4L2.4 13.6c-.6.7-.1 1.9.9 1.9h13.4c1 0 1.5-1.2.9-1.9l-1.1-1.6a2.4 2.4 0 0 1-.5-1.4V8a6 6 0 0 0-6-6Z" />
            <path d="M8.2 17a1.8 1.8 0 0 0 3.6 0z" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#000000]" />
        </button>
      </div>
    </div>
  );
}
