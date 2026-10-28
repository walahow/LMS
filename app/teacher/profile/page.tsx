import { requireRole } from "@/lib/auth";
import { TeacherProfileView, type TeacherProfileData } from "@/components/TeacherProfileView";

export const dynamic = "force-dynamic";

const MOCK_TEACHER: TeacherProfileData = {
  fullName: "Bu Sari Wulandari, M.Pd.",
  initials: "SW",
  email: "teacher@lms.local",
  roleTitle: "GURU PENGAMPU",
};

async function getTeacherProfileData(): Promise<TeacherProfileData> {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!isSupabaseConfigured) {
    return MOCK_TEACHER;
  }

  try {
    const { user, profile } = await requireRole("teacher");
    const initials = profile.full_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return {
      fullName: profile.full_name,
      initials: initials || "GR",
      email: user.email || "teacher@lms.local",
      roleTitle: "GURU PENGAMPU",
    };
  } catch {
    return MOCK_TEACHER;
  }
}

export default async function TeacherProfilePage() {
  const profile = await getTeacherProfileData();

  return <TeacherProfileView profile={profile} />;
}
