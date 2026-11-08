"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function signOut() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore errors on sign out and proceed to redirect
    }
  }
  redirect("/login");
}

export type ChangePasswordState = {
  error?: string;
  success?: boolean;
  message?: string;
};

function formatSupabasePasswordError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("session missing") ||
    lower.includes("not authenticated") ||
    lower.includes("jwt") ||
    lower.includes("user not found")
  ) {
    return "Sesi login Anda telah berakhir atau tidak valid. Silakan keluar dan login kembali.";
  }
  if (
    lower.includes("should be different") ||
    lower.includes("same password") ||
    lower.includes("different from the old")
  ) {
    return "Kata sandi baru tidak boleh sama dengan kata sandi saat ini.";
  }
  if (
    lower.includes("rate limit") ||
    lower.includes("security purposes") ||
    lower.includes("too many requests") ||
    lower.includes("seconds")
  ) {
    return "Terlalu banyak permintaan perubahan kata sandi. Silakan tunggu beberapa saat sebelum mencoba lagi.";
  }
  if (
    lower.includes("at least 8") ||
    lower.includes("too short") ||
    lower.includes("minimum")
  ) {
    return "Kata sandi baru minimal 8 karakter.";
  }
  if (lower.includes("weak") || lower.includes("pwned")) {
    return "Kata sandi terlalu mudah ditebak. Silakan gunakan kombinasi huruf dan angka yang lebih kuat.";
  }
  return `Gagal memperbarui kata sandi: ${message}`;
}

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const password = String(
    formData.get("password") ?? formData.get("newPassword") ?? ""
  ).trim();
  const confirm = String(
    formData.get("confirm") ?? formData.get("confirmPassword") ?? ""
  ).trim();

  // 1. Validasi keberadaan & panjang kata sandi baru
  if (!password) {
    return { error: "Kata sandi baru tidak boleh kosong." };
  }
  if (password.length < 8) {
    return {
      error: `Kata sandi baru minimal 8 karakter (saat ini ${password.length} karakter).`,
    };
  }

  // 2. Validasi konfirmasi kata sandi
  if (!confirm) {
    return { error: "Harap masukkan konfirmasi kata sandi baru." };
  }
  if (password !== confirm) {
    return { error: "Konfirmasi kata sandi tidak cocok dengan kata sandi baru." };
  }

  // 3. Eksekusi pembaruan ke live Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();

      // Pastikan sesi login aktif masih valid
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          error:
            "Sesi login Anda telah berakhir. Silakan keluar dan login kembali terlebih dahulu.",
        };
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return { error: formatSupabasePasswordError(error.message) };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("fetch failed") ||
        msg.toLowerCase().includes("network")
      ) {
        return {
          error:
            "Gagal terhubung ke server database. Periksa koneksi internet Anda.",
        };
      }
      return {
        error:
          "Terjadi kesalahan sistem saat memperbarui kata sandi. Silakan coba lagi.",
      };
    }
  }

  return { success: true, message: "Kata sandi berhasil diperbarui!" };
}
