import { requireRole } from "@/lib/auth";
import { StudentProfileView, type StudentProfileData } from "@/components/StudentProfileView";

export const dynamic = "force-dynamic";

const MOCK_PROFILE: StudentProfileData = {
  fullName: "Rani Putri",
  initials: "RP",
  email: "student@lms.local",
  grade: "KELAS X-A",
};

async function getProfileData(): Promise<StudentProfileData> {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!isSupabaseConfigured) {
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

    return {
      fullName: profile.full_name,
      initials: initials || "ST",
      email: user.email || "student@lms.local",
      grade: "KELAS X-A",
    };
  } catch {
    return MOCK_PROFILE;
  }
}

export default async function StudentProfilePage() {
  const profile = await getProfileData();

  return <StudentProfileView profile={profile} />;
}
