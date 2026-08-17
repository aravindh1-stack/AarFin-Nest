import { SkeletonBlock } from "@/components/skeleton-block";

export default function DashboardLoading() {
  return (
    <div>
      <div className="border-b border-slate-200/70 px-4 py-4 sm:px-6 lg:px-8 dark:border-slate-800/50">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="mt-2 h-4 w-64" />
      </div>

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-28" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SkeletonBlock className="h-80 lg:col-span-2" />
          <SkeletonBlock className="h-80" />
        </div>
      </div>
    </div>
  );
}
