import { DashboardTopbar } from "@/components/dashboard/topbar";
import { CollectionsHub } from "@/components/collections/collections-hub";

export default function CollectionsPage() {
  return (
    <div>
      <DashboardTopbar
        title="Collections Hub"
        description="Search members, review dues, and record FIFO payments"
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <CollectionsHub />
      </div>
    </div>
  );
}
