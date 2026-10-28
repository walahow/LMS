import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

const MOCK_DEMO_PROFILES: Record<UserRole, { id: string; role: UserRole; full_name: string }> = {
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

export async function requireUser() {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("lms-demo-role")?.value as UserRole | undefined;
  const supabase = await createClient();

  // 1. Mock demo session support
  if (demoRole && (demoRole === "student" || demoRole === "teacher" || demoRole === "admin")) {
    const profile = MOCK_DEMO_PROFILES[demoRole];
    return {
      supabase,
      user: { id: profile.id, email: `${demoRole}@lms.local` } as any,
      profile,
    };
  }

  // 2. Standalone fallback when Supabase is unconfigured and no cookie
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const profile = MOCK_DEMO_PROFILES.student;
    return {
      supabase,
      user: { id: profile.id, email: "rani@lms.local" } as any,
      profile,
    };
  }

  // 3. Live Supabase Auth verification
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", user.id)
      .single();
    if (!profile) redirect("/login");

    return { supabase, user, profile };
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      String((err as any).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    redirect("/login");
  }
}

/** Belt-and-suspenders check alongside middleware's route-group guard. */
export async function requireRole(role: UserRole) {
  const ctx = await requireUser();
  if (ctx.profile.role !== role) redirect("/login");
  return ctx;
}
