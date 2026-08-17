import { SkeletonBlock } from "@/components/skeleton-block";

export default function CollectionsLoading() {
  return (
    <div>
      <div className="border-b border-slate-200/70 px-4 py-4 sm:px-6 lg:px-8 dark:border-slate-800/50">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="mt-2 h-4 w-72" />
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SkeletonBlock className="h-10 w-full sm:max-w-xs" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
