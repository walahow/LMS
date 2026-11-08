import { requireRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { TeacherProfileView, type TeacherProfileData } from "@/components/TeacherProfileView";

export const dynamic = "force-dynamic";

const MOCK_TEACHER: TeacherProfileData = {
  fullName: "Severus Snape",
  initials: "SS",
  email: "teacher@lms.local",
  roleTitle: "GURU PENGAMPU",
};

async function getTeacherProfileData(): Promise<TeacherProfileData> {
  if (!isSupabaseConfigured()) {
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
      initials: initials || "SS",
      email: user.email || "teacher@lms.local",
      roleTitle: "GURU PENGAMPU",
    };
  } catch (error) {
    console.warn("getTeacherProfileData error, fallback to mock:", error);
    return MOCK_TEACHER;
  }
}

export default async function TeacherProfilePage() {
  const profile = await getTeacherProfileData();
  return <TeacherProfileView profile={profile} />;
}
