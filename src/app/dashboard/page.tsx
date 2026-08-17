import { DashboardTopbar } from "@/components/dashboard/topbar";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table";
import { RouteProgress } from "@/components/dashboard/route-progress";

export default function DashboardOverviewPage() {
  return (
    <div>
      <DashboardTopbar
        title="Overview"
        description="Head office command center — live across all branch tenants"
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <MetricCards />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivityTable />
          </div>
          <RouteProgress />
        </div>
      </div>
    </div>
  );
}
