"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

export type LoginState = { error?: string };

function roleHome(role: UserRole) {
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

function detectRole(email: string): UserRole {
  const lower = email.toLowerCase().trim();
  if (lower.includes("teacher")) return "teacher";
  if (lower.includes("admin")) return "admin";
  return "student";
}

export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const demoRoleParam = String(formData.get("demoRole") ?? "").trim() as UserRole | "";

  // 1. Live Supabase Authentication
  if (isSupabaseConfigured()) {
    if (!email || !password) {
      return { error: "Email dan kata sandi wajib diisi." };
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data?.user) {
        return { error: "Email atau kata sandi salah." };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = (profile?.role ?? "student") as UserRole;
      redirect(roleHome(role));
    } catch (err: unknown) {
      // Re-throw Next.js redirect errors so navigation succeeds
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        throw err;
      }
      return { error: "Terjadi kesalahan saat masuk. Silakan coba lagi." };
    }
  }

  // 2. Standalone Demo Mode Fallback (when Supabase credentials are not yet set)
  const role = demoRoleParam || detectRole(email);
  redirect(roleHome(role));
}
