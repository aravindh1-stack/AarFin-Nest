export type InstallmentStatus = "PAID" | "PARTIAL" | "PENDING" | "UPCOMING";

const statusStyles: Record<InstallmentStatus, string> = {
  PAID: "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400/20",
  PARTIAL:
    "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400 dark:ring-amber-400/20",
  PENDING:
    "bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/20 dark:text-rose-400 dark:ring-rose-400/20",
  UPCOMING:
    "bg-slate-500/10 text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:text-slate-400 dark:ring-slate-400/20",
};

const statusDot: Record<InstallmentStatus, string> = {
  PAID: "bg-emerald-500",
  PARTIAL: "bg-amber-500",
  PENDING: "bg-rose-500",
  UPCOMING: "bg-slate-400",
};

export function StatusPill({ status }: { status: InstallmentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
      {status}
    </span>
  );
}
