import { fetchAdminData } from "@/lib/admin-data";
import { AdminProfileView } from "@/components/AdminProfileView";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const { profile } = await fetchAdminData();

  return (
    <AdminProfileView
      profile={{
        fullName: profile.fullName,
        initials: profile.initials,
        email: profile.email,
        roleTitle: "Administrator Sistem",
      }}
    />
  );
}
