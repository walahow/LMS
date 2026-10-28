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

  let targetRedirect: string | null = null;

  // 1. If Supabase is configured, try authenticating with Supabase Auth first
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });

      if (!error && data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        // Clear mock demo session cookie if live login succeeded
        const cookieStore = await cookies();
        cookieStore.delete("lms-demo-role");

        targetRedirect = roleHome((profile?.role ?? "student") as UserRole);
      } else {
        console.warn("[login] Supabase auth rejected:", error?.message);
      }
    } catch (err) {
      console.warn("[login] Supabase connection error:", err);
    }
  }

  // 2. If live login succeeded, perform redirect
  if (targetRedirect) {
    redirect(targetRedirect);
  }

  // 3. Fallback: If live login was unsuccessful BUT user entered a demo account, log them in via mock demo session!
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

  // 4. Otherwise, return generic error for invalid credentials
  return { error: "Email atau kata sandi salah." };
}
