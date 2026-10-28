"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

export type LoginState = { error?: string };

function roleHome(role: UserRole) {
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email atau kata sandi salah." };
  }

  // Standalone preview fallback when Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    if (email.toLowerCase().includes("teacher")) {
      redirect("/teacher/dashboard");
    } else if (email.toLowerCase().includes("admin")) {
      redirect("/admin/dashboard");
    } else {
      redirect("/dashboard");
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // One generic message for any failure — never reveal whether the email exists.
  // TEMP diagnostic logging (server-side only, never shown to the user) while
  // debugging the seeded accounts against a fresh Supabase project.
  if (error) {
    console.error("[login] signInWithPassword failed", {
      message: error.message,
      status: error.status,
      code: (error as { code?: string }).code,
    });
    return { error: "Email atau kata sandi salah." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  redirect(roleHome((profile?.role ?? "student") as UserRole));
}
