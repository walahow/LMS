"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

export type LoginState = { error?: string };

function roleHome(role: UserRole) {
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

function detectDemoRole(email: string): UserRole | null {
  const lower = email.toLowerCase().trim();
  if (lower.includes("teacher")) return "teacher";
  if (lower.includes("admin")) return "admin";
  if (lower.includes("student") || lower.includes("rani")) return "student";
  return null;
}

export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const demoRoleParam = String(formData.get("demoRole") ?? "").trim() as UserRole | "";

  if (!email || !password) {
    return { error: "Email atau kata sandi salah." };
  }

  const detectedRole = demoRoleParam || detectDemoRole(email);
  const isDemoCredential = Boolean(
    detectedRole &&
      (password === "password123" || email.toLowerCase().endsWith("@lms.local"))
  );

  // 1. Instant Demo Bypass (0ms latency, zero external network delay)
  if (isDemoCredential && detectedRole) {
    const cookieStore = await cookies();
    cookieStore.set("lms-demo-role", detectedRole, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    redirect(roleHome(detectedRole));
  }

  // 2. If Supabase is unconfigured, reject non-demo credentials
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: "Email atau kata sandi salah." };
  }

  // 3. Live Supabase Auth for real accounts
  try {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Clear any leftover demo cookie
      const cookieStore = await cookies();
      cookieStore.delete("lms-demo-role");

      redirect(roleHome((profile?.role ?? "student") as UserRole));
    }
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      String((err as any).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    console.warn("[login] Supabase auth error:", err);
  }

  return { error: "Email atau kata sandi salah." };
}
