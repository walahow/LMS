"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const cookieStore = await cookies();

  // Explicitly clear demo cookie with path: "/" and expiration
  cookieStore.set("lms-demo-role", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.delete({
    name: "lms-demo-role",
    path: "/",
  });
  cookieStore.delete("lms-demo-role");

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      await supabase.auth.signOut();
    }
  } catch {
    // Offline / standalone
  }

  redirect("/login?logout=1");
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

  const cookieStore = await cookies();
  const isDemo = Boolean(cookieStore.get("lms-demo-role")?.value);
  if (isDemo || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Simulated password update for demo session
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { error: "Gagal mengubah kata sandi. Coba lagi." };
    }
    return { success: true };
  } catch {
    return { error: "Gagal mengubah kata sandi. Coba lagi." };
  }
}
