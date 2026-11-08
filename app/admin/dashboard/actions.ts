"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { generateSet, type GeneratedQuestion } from "@/lib/ai";
import type { AdminQuestion, AdminUser } from "@/lib/admin-data";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type GenerateSetState = { error?: string };

export async function generateQuestionSet(
  _prevState: GenerateSetState,
  formData: FormData,
): Promise<GenerateSetState> {
  const { supabase, user } = await requireRole("admin");

  const title = String(formData.get("title") ?? "").trim();
  const indicator = String(formData.get("indicator") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const count = Number(formData.get("count") ?? 5);

  if (!title || !indicator) {
    return { error: "Judul dan indikator wajib diisi." };
  }

  // Session-only review mode: redirect back to dashboard
  redirect("/admin/dashboard");
}

export type GenerateAIResult = {
  success: boolean;
  questions?: AdminQuestion[];
  error?: string;
};

/**
 * Server Action: Calls real Gemini AI to generate 3-tier diagnostic questions.
 * Does not write to any database; returns structured questions for in-session review.
 */
export async function generateAIQuestionsAction(params: {
  indicator: string;
  title: string;
  subject?: string;
  grade?: string;
  count: number;
  difficulty: "mudah" | "sedang" | "sulit";
}): Promise<GenerateAIResult> {
  try {
    if (!params.indicator?.trim()) {
      return {
        success: false,
        error: "Indikator pembelajaran wajib diisi sebelum membuat soal.",
      };
    }

    if (params.indicator.trim().length < 10) {
      return {
        success: false,
        error: "Indikator pembelajaran terlalu singkat. Tuliskan capaian materi yang lebih spesifik.",
      };
    }

    const rawQuestions: GeneratedQuestion[] = await generateSet({
      indicator: params.indicator.trim(),
      subject: params.subject?.trim() || "Umum",
      grade: params.grade || "Kelas 10",
      count: Math.min(Math.max(params.count || 3, 1), 10),
      difficulty: params.difficulty || "sedang",
    });

    const timestamp = Date.now();
    const adminQuestions: AdminQuestion[] = rawQuestions.map((q, idx) => ({
      id: `ai-q-${timestamp}-${idx + 1}`,
      position: idx + 1,
      stem: q.stem,
      options: q.options,
      correctOption: q.correct_option,
      reasons: q.reasons,
      correctReason: q.correct_reason,
      explanation: q.explanation,
    }));

    return {
      success: true,
      questions: adminQuestions,
    };
  } catch (err: unknown) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    console.error("[generateAIQuestionsAction] error:", rawMsg);

    // Map technical errors to user-friendly messages for non-power users (teachers/admins)
    let friendlyMessage = "Gagal membuat soal otomatis. Silakan periksa koneksi internet atau coba lagi.";

    if (rawMsg.includes("CONFIG_MISSING")) {
      friendlyMessage = "Layanan AI belum dikonfigurasi. Hubungi administrator untuk mengisi API Key pada file .env.local.";
    } else if (rawMsg.includes("AUTH_INVALID")) {
      friendlyMessage = "Kunci API tidak valid atau telah kedaluwarsa. Periksa kembali API Key pada file .env.local.";
    } else if (rawMsg.includes("RATE_LIMITED")) {
      friendlyMessage = "Layanan AI sedang sibuk karena banyaknya permintaan. Silakan tunggu 1–2 menit lalu coba kembali.";
    } else if (rawMsg.includes("SERVICE_BUSY")) {
      friendlyMessage = "Server AI sedang melayani beban tinggi. Silakan coba sesaat lagi.";
    } else if (rawMsg.includes("NETWORK_ERROR") || rawMsg.includes("fetch failed")) {
      friendlyMessage = "Tidak dapat terhubung ke layanan AI. Pastikan perangkat terhubung ke internet.";
    } else if (rawMsg.includes("PARSE_")) {
      friendlyMessage = "Format jawaban AI tidak sesuai skema. Coba perjelas atau sederhanakan kalimat indikator pembelajaran.";
    }

    return {
      success: false,
      error: friendlyMessage,
    };
  }
}

/**
 * Server Action: Provision a new user account.
 */
export async function createUserAction(params: {
  fullName: string;
  email: string;
  role: "student" | "teacher" | "admin";
  grade?: string;
  password?: string;
}): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const fullName = params.fullName.trim();
    const email = params.email.trim().toLowerCase();
    const role = params.role;
    const password = params.password?.trim() || "password123";
    const grade = role === "student" ? params.grade?.trim() || "Kelas 10" : undefined;

    if (!fullName || !email) {
      return { success: false, error: "Nama lengkap dan email wajib diisi." };
    }

    if (!isSupabaseConfigured()) {
      const parts = fullName.split(" ");
      const initials = parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : (parts[0].slice(0, 2) || "US").toUpperCase();

      return {
        success: true,
        user: {
          id: `mock-usr-${Date.now()}`,
          fullName,
          email,
          role,
          grade,
          initials,
          createdAt: "Hari ini",
        },
      };
    }

    await requireRole("admin");
    const admin = createAdminClient();

    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        grade,
      },
    });

    if (authErr || !authData.user) {
      return { success: false, error: authErr?.message || "Gagal membuat akun pada auth server." };
    }

    const { error: profErr } = await admin.from("profiles").upsert({
      id: authData.user.id,
      full_name: fullName,
      role,
    });

    if (profErr) {
      return { success: false, error: profErr.message };
    }

    const parts = fullName.split(" ");
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : (parts[0].slice(0, 2) || "US").toUpperCase();

    const newUser: AdminUser = {
      id: authData.user.id,
      fullName,
      email,
      role,
      grade,
      initials,
      createdAt: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    revalidatePath("/admin/dashboard");
    revalidatePath("/teacher/dashboard");
    return { success: true, user: newUser };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[createUserAction] error:", msg);
    return { success: false, error: `Gagal membuat akun: ${msg}` };
  }
}

/**
 * Server Action: Reset user password to default or specified password.
 */
export async function resetUserPasswordAction(params: {
  userId: string;
  newPassword?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    await requireRole("admin");
    const admin = createAdminClient();

    // Prevent resetting admin passwords from this endpoint
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", params.userId)
      .single();

    if (targetProfile?.role === "admin") {
      return {
        success: false,
        error: "Kata sandi akun administrator tidak dapat direset dari panel ini.",
      };
    }

    const { error } = await admin.auth.admin.updateUserById(params.userId, {
      password: params.newPassword || "password123",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[resetUserPasswordAction] error:", msg);
    return { success: false, error: `Gagal mereset kata sandi: ${msg}` };
  }
}


/**
 * Server Action: Delete a student or teacher user account.
 * Administrator accounts cannot be deleted.
 */
export async function deleteUserAction(params: {
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!params.userId) {
      return { success: false, error: "ID pengguna wajib disertakan." };
    }

    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    const { user: currentAdmin } = await requireRole("admin");
    const admin = createAdminClient();

    // Prevent deleting self
    if (currentAdmin.id === params.userId) {
      return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri." };
    }

    // Inspect target user role
    const { data: targetProfile, error: profErr } = await admin
      .from("profiles")
      .select("role, full_name")
      .eq("id", params.userId)
      .single();

    if (profErr || !targetProfile) {
      return { success: false, error: "Pengguna tidak ditemukan di database." };
    }

    if (targetProfile.role === "admin") {
      return {
        success: false,
        error: "Akun administrator tidak dapat dihapus demi keamanan sistem.",
      };
    }

    // Disassociate any question sets created by this user
    await admin
      .from("question_sets")
      .update({ created_by: null })
      .eq("created_by", params.userId);

    // Delete user from Supabase auth (cascades to profiles, attempts, responses)
    const { error: delErr } = await admin.auth.admin.deleteUser(params.userId);

    if (delErr) {
      return { success: false, error: delErr.message };
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/teacher/dashboard");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[deleteUserAction] error:", msg);
    return { success: false, error: `Gagal menghapus akun: ${msg}` };
  }
}

/**
 * Server Action: Toggle published status for a question set.
 */
export async function togglePublishSetAction(params: {
  setId: string;
  published: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    const { supabase } = await requireRole("admin");

    const { error } = await supabase
      .from("question_sets")
      .update({ published: params.published })
      .eq("id", params.setId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/sets/${params.setId}`);
    revalidatePath("/dashboard");
    revalidatePath("/teacher/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[togglePublishSetAction] error:", msg);
    return { success: false, error: `Gagal mengubah status publikasi: ${msg}` };
  }
}

/**
 * Server Action: Save AI generated question set into the database.
 */
export async function saveQuestionSetAction(params: {
  title: string;
  indicator: string;
  subject?: string;
  grade?: string;
  difficulty?: "mudah" | "sedang" | "sulit";
  published: boolean;
  questions: AdminQuestion[];
}): Promise<{ success: boolean; setId?: string; error?: string }> {
  try {
    const title = params.title.trim();
    const indicator = params.indicator.trim();
    const subject = params.subject?.trim() || "Fisika";
    const grade = params.grade?.trim() || "Kelas 10";

    if (!title || !indicator) {
      return { success: false, error: "Judul dan indikator pembelajaran wajib diisi." };
    }

    if (!params.questions || params.questions.length === 0) {
      return { success: false, error: "Paket soal harus memiliki minimal 1 butir soal." };
    }

    if (!isSupabaseConfigured()) {
      return { success: true, setId: `mock-pack-${Date.now()}` };
    }

    const { user } = await requireRole("admin");
    const admin = createAdminClient();

    const { data: newSet, error: setErr } = await admin
      .from("question_sets")
      .insert({
        title,
        indicator,
        subject,
        grade,
        published: params.published,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (setErr || !newSet) {
      return { success: false, error: setErr?.message || "Gagal menyimpan paket soal ke database." };
    }

    const questionRows = params.questions.map((q, idx) => ({
      set_id: newSet.id,
      position: idx + 1,
      stem: q.stem,
      options: q.options,
      correct_option: q.correctOption,
      reasons: q.reasons,
      correct_reason: q.correctReason,
      explanation: q.explanation || null,
    }));

    const { error: qErr } = await admin.from("questions").insert(questionRows);
    if (qErr) {
      // Clean up set if questions insertion failed
      await admin.from("question_sets").delete().eq("id", newSet.id);
      return { success: false, error: `Gagal menyimpan butir soal: ${qErr.message}` };
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    revalidatePath("/teacher/dashboard");
    return { success: true, setId: newSet.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[saveQuestionSetAction] error:", msg);
    return { success: false, error: `Gagal menyimpan paket soal: ${msg}` };
  }
}
