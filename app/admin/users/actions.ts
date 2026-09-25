"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/database.types";

export type CreateUserState = { error?: string; success?: string };

export async function createUser(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireRole("admin");

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "") as UserRole;
  const password = String(formData.get("password") ?? "");

  if (!email || !fullName || !password) {
    return { error: "Semua kolom wajib diisi." };
  }
  if (password.length < 8) {
    return { error: "Kata sandi minimal 8 karakter." };
  }
  if (!["student", "teacher", "admin"].includes(role)) {
    return { error: "Peran tidak valid." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return { error: `Gagal membuat pengguna: ${error?.message ?? "unknown error"}` };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: data.user.id, role, full_name: fullName });

  if (profileError) {
    return { error: `Pengguna dibuat tapi profil gagal disimpan: ${profileError.message}` };
  }

  revalidatePath("/admin/users");
  return { success: `Pengguna ${email} berhasil dibuat.` };
}

export type ResetPasswordState = { error?: string; success?: string };

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireRole("admin");

  const userId = String(formData.get("user_id") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!userId || password.length < 8) {
    return { error: "Kata sandi minimal 8 karakter." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) {
    return { error: `Gagal mereset kata sandi: ${error.message}` };
  }

  return { success: "Kata sandi berhasil direset." };
}
