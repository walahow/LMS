"use server";

import { redirect } from "next/navigation";

/**
 * UI/UX Review Mode:
 * Direct navigation to /login without session requirements.
 */
export async function signOut() {
  redirect("/login");
}

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Kata sandi minimal 8 karakter." };
  }
  if (password !== confirm) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  // Simulated password change for UI/UX review
  return { success: true };
}
