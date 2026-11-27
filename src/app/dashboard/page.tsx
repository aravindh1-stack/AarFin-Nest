import { DashboardTopbar } from "@/components/dashboard/topbar";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table";
import { RouteProgress } from "@/components/dashboard/route-progress";

export default function DashboardOverviewPage() {
  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden">
      <DashboardTopbar
        title="Overview"
        description="Head office command center — live across all branch tenants"
      />

      <div className="w-full max-w-full min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
        <MetricCards />

        <div className="grid gap-6 lg:grid-cols-3 w-full max-w-full min-w-0">
          <div className="lg:col-span-2 w-full max-w-full min-w-0">
            <RecentActivityTable />
          </div>
          <div className="w-full max-w-full min-w-0">
            <RouteProgress />
          </div>
        </div>
      </div>
    </div>
  );
}
