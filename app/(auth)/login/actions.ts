"use server";

import { redirect } from "next/navigation";
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

/**
 * UI/UX Review Mode:
 * Direct pass-through to role dashboard. Never fails or blocks reviewer.
 */
export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const demoRoleParam = String(formData.get("demoRole") ?? "").trim() as UserRole | "";

  const role = demoRoleParam || detectRole(email);
  redirect(roleHome(role));
}
