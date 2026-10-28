import { fetchAdminData } from "@/lib/admin-data";
import { AdminDashboardView } from "@/components/AdminDashboardView";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { profile, stats, questionSets, users } = await fetchAdminData();

  return (
    <AdminDashboardView
      profile={profile}
      stats={stats}
      questionSets={questionSets}
      users={users}
    />
  );
}
