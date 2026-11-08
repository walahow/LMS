import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

const MOCK_PROFILES: Record<UserRole, { id: string; role: UserRole; full_name: string }> = {
  student: {
    id: "00000000-0000-0000-0000-000000000003",
    role: "student",
    full_name: "Hermione Granger",
  },
  teacher: {
    id: "00000000-0000-0000-0000-000000000002",
    role: "teacher",
    full_name: "Severus Snape",
  },
  admin: {
    id: "00000000-0000-0000-0000-000000000001",
    role: "admin",
    full_name: "Albus Dumbledore",
  },
};

/**
 * Universal Mock Supabase Client:
 * Chains any .from().select().eq().order() call and safely resolves to { data: [], error: null }.
 * Prevents any "Cannot read properties of null (reading 'from')" prerendering or runtime crash.
 */
function createMockQuery(): any {
  const query: any = {
    select: () => query,
    eq: () => query,
    neq: () => query,
    in: () => query,
    not: () => query,
    is: () => query,
    order: () => query,
    limit: () => query,
    range: () => query,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: (val: any) => any) => resolve({ data: [], error: null }),
  };
  return query;
}

export function createMockSupabaseClient() {
  return {
    from: (_table: string) => createMockQuery(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>;
}

export async function requireUser() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
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
  }

  const profile = MOCK_PROFILES.student;
  return {
    supabase: createMockSupabaseClient(),
    user: { id: profile.id, email: "student@lms.local" } as any,
    profile,
  };
}

export async function requireRole(role: UserRole) {
  if (isSupabaseConfigured()) {
    const ctx = await requireUser();
    // Admin is a superuser and can access student and teacher pages
    if (ctx.profile.role !== role && ctx.profile.role !== "admin") {
      redirect("/login");
    }
    return ctx;
  }

  const profile = MOCK_PROFILES[role] ?? MOCK_PROFILES.student;
  return {
    supabase: createMockSupabaseClient(),
    user: { id: profile.id, email: `${role}@lms.local` } as any,
    profile,
  };
}
