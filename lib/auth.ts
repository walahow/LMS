import type { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

const MOCK_PROFILES: Record<UserRole, { id: string; role: UserRole; full_name: string }> = {
  student: {
    id: "00000000-0000-0000-0000-000000000003",
    role: "student",
    full_name: "Rani Putri",
  },
  teacher: {
    id: "00000000-0000-0000-0000-000000000002",
    role: "teacher",
    full_name: "Bu Sari Wulandari, M.Pd.",
  },
  admin: {
    id: "00000000-0000-0000-0000-000000000001",
    role: "admin",
    full_name: "Pak Andi Kurniawan",
  },
};

/**
 * UI/UX Review Mode:
 * Direct mock profile and user. Zero auth blockers, zero cookies, zero network overhead.
 */
export async function requireUser() {
  const profile = MOCK_PROFILES.student;
  return {
    supabase: null as unknown as Awaited<ReturnType<typeof createClient>>,
    user: { id: profile.id, email: "student@lms.local" } as any,
    profile,
  };
}

/** Belt-and-suspenders check returning the appropriate role's mock profile. */
export async function requireRole(role: UserRole) {
  const profile = MOCK_PROFILES[role] ?? MOCK_PROFILES.student;
  return {
    supabase: null as unknown as Awaited<ReturnType<typeof createClient>>,
    user: { id: profile.id, email: `${role}@lms.local` } as any,
    profile,
  };
}
