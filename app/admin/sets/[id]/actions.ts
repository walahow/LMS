"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { isMissingColumnError } from "@/lib/auth-utils";

export type UpdateQuestionState = { error?: string; success?: boolean };

export async function updateQuestion(
  _prevState: UpdateQuestionState,
  formData: FormData,
): Promise<UpdateQuestionState> {
  const questionId = String(formData.get("question_id") ?? "");
  const setId = String(formData.get("set_id") ?? "");
  const indicator = String(formData.get("indicator") ?? "").trim();
  const subtopic = String(formData.get("subtopic") ?? "").trim();
  const cognitiveLevel = String(formData.get("cognitive_level") ?? "").trim();
  const stem = String(formData.get("stem") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const optionIndices = formData.has("option_4") ? [0, 1, 2, 3, 4] : [0, 1, 2, 3];
  const options = optionIndices.map((i) => String(formData.get(`option_${i}`) ?? "").trim());
  const reasons = [0, 1, 2, 3].map((i) => String(formData.get(`reason_${i}`) ?? "").trim());
  const correctOption = Number(formData.get("correct_option"));
  const correctReason = Number(formData.get("correct_reason"));

  if (!questionId || !stem || options.some((o) => !o) || reasons.some((r) => !r)) {
    return { error: "Semua kolom wajib diisi." };
  }
  if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption >= options.length) {
    return { error: "Pilih opsi jawaban yang benar." };
  }
  if (!Number.isInteger(correctReason) || correctReason < 0 || correctReason > 3) {
    return { error: "Pilih opsi alasan yang benar." };
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    await requireRole("admin");
    const admin = createAdminClient();

    const basePayload = {
      stem,
      options,
      reasons,
      correct_option: correctOption,
      correct_reason: correctReason,
      explanation: explanation || null,
    };

    let { error } = await admin
      .from("questions")
      .update({
        ...basePayload,
        indicator: indicator || null,
        subtopic: subtopic || null,
        cognitive_level: cognitiveLevel || null,
      })
      .eq("id", questionId);

    if (error && isMissingColumnError(error)) {
      const fallback = await admin
        .from("questions")
        .update(basePayload)
        .eq("id", questionId);
      error = fallback.error;
    }

    if (error) {
      return { error: `Gagal menyimpan: ${error.message}` };
    }

    revalidatePath(`/admin/sets/${setId}`);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Gagal menyimpan: ${msg}` };
  }
}

export async function togglePublish(formData: FormData) {
  const setId = String(formData.get("set_id") ?? "");
  const next = formData.get("next") === "true";

  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    await requireRole("admin");
    const admin = createAdminClient();

    await admin.from("question_sets").update({ published: next }).eq("id", setId);

    revalidatePath(`/admin/sets/${setId}`);
    revalidatePath("/admin/sets");
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    revalidatePath("/teacher/dashboard");
  } catch (err) {
    console.error("[togglePublish] error:", err);
  }
}
