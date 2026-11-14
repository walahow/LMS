import { requireRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { StudentProfileView, type StudentProfileData } from "@/components/StudentProfileView";

export const dynamic = "force-dynamic";

const MOCK_PROFILE: StudentProfileData = {
  fullName: "Hermione Granger",
  initials: "HG",
  email: "student@lms.local",
  grade: "KELAS X-A",
};

async function getProfileData(): Promise<StudentProfileData> {
  if (!isSupabaseConfigured()) {
    return MOCK_PROFILE;
  }

  try {
    const { user, profile } = await requireRole("student");
    const initials = profile.full_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const displayContact =
      profile.username && (!user.email || user.email.endsWith("@lms.local"))
        ? `@${profile.username}`
        : user.email || "student@lms.local";

    return {
      fullName: profile.full_name,
      initials: initials || "HG",
      email: displayContact,
      grade: profile.grade || "KELAS X-A",
    };
  } catch (error) {
    console.warn("getProfileData error, fallback to mock:", error);
    return MOCK_PROFILE;
  }
}

export default async function StudentProfilePage() {
  const profile = await getProfileData();
  return <StudentProfileView profile={profile} />;
}
