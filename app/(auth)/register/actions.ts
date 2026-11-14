"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingColumnError, sanitizeUsername } from "@/lib/auth-utils";

export type RegisterState = {
  error?: string;
  fieldErrors?: {
    fullName?: string;
    username?: string;
    grade?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export async function registerStudent(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const rawUsername = String(formData.get("username") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: RegisterState["fieldErrors"] = {};

  // 1. Validation
  if (!fullName || fullName.length < 2) {
    fieldErrors.fullName = "Nama lengkap minimal 2 karakter.";
  }

  const username = sanitizeUsername(rawUsername);
  if (!username || username.length < 3 || username.length > 20) {
    fieldErrors.username = "Username harus 3–20 karakter (hanya huruf, angka, _, ., atau -).";
  }

  if (!grade || grade.length < 2) {
    fieldErrors.grade = "Kelas / rombel wajib diisi (misal: Kelas X-A, 10 IPA 1).";
  }

  if (!password || password.length < 8) {
    fieldErrors.password = "Kata sandi minimal 8 karakter.";
  }

  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // 2. Offline / Standalone Demo Mode Fallback
  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  // 3. Live Supabase Provisioning (strictly locked to 'student' role)
  try {
    const admin = createAdminClient();
    const syntheticEmail = `${username}@lms.local`;

    // Check if username is already taken in profiles table
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingProfile) {
      return {
        fieldErrors: {
          username: "Username sudah digunakan. Silakan pilih username lain.",
        },
      };
    }

    // Create user in Supabase Auth
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username,
        grade,
        role: "student",
      },
    });

    if (authErr || !authData.user) {
      const msg = authErr?.message?.toLowerCase() || "";
      if (msg.includes("already registered") || msg.includes("already exists")) {
        return {
          fieldErrors: {
            username: "Username sudah terdaftar. Silakan pilih username lain atau langsung login.",
          },
        };
      }
      return { error: authErr?.message || "Gagal membuat akun siswa pada server auth." };
    }

    // Upsert into profiles table with 'student' role (fallback to base columns if 0004 migration is pending)
    let { error: profErr } = await admin.from("profiles").upsert({
      id: authData.user.id,
      full_name: fullName,
      role: "student",
      grade,
      username,
    });

    if (profErr && isMissingColumnError(profErr)) {
      const fallbackRes = await admin.from("profiles").upsert({
        id: authData.user.id,
        full_name: fullName,
        role: "student",
      });
      profErr = fallbackRes.error;
    }

    if (profErr) {
      console.error("[registerStudent] Error upserting profile:", profErr.message);
      // Attempt cleanup of orphaned auth user
      await admin.auth.admin.deleteUser(authData.user.id).catch(() => {});
      return { error: `Gagal menyimpan profil siswa: ${profErr.message}` };
    }

    // 4. Instant Login: authenticate user immediately with synthetic email & password
    const supabase = await createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password,
    });

    if (signInErr) {
      console.error("[registerStudent] Auto-login error:", signInErr.message);
      redirect("/login");
    }

    revalidatePath("/dashboard");
    revalidatePath("/teacher/dashboard");
    revalidatePath("/admin/dashboard");
    redirect("/dashboard");
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[registerStudent] unexpected error:", msg);
    return { error: `Terjadi kesalahan saat pendaftaran: ${msg}` };
  }
}
