export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-[#000000]">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-teal-500/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-teal-500" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Loading…
      </p>
    </div>
  );
}
