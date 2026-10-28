import { fetchTeacherData } from "@/lib/teacher-data";
import { TeacherDashboardView } from "@/components/TeacherDashboardView";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const { profile, stats, testPacks } = await fetchTeacherData();

  return (
    <TeacherDashboardView
      profile={profile}
      stats={stats}
      testPacks={testPacks}
    />
  );
}
