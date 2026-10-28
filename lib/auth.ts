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
  const profile = MOCK_PROFILES.student;
  return {
    supabase: createMockSupabaseClient(),
    user: { id: profile.id, email: "student@lms.local" } as any,
    profile,
  };
}

export async function requireRole(role: UserRole) {
  const profile = MOCK_PROFILES[role] ?? MOCK_PROFILES.student;
  return {
    supabase: createMockSupabaseClient(),
    user: { id: profile.id, email: `${role}@lms.local` } as any,
    profile,
  };
}
