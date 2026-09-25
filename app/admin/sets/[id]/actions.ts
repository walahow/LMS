"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";

export type UpdateQuestionState = { error?: string; success?: boolean };

export async function updateQuestion(
  _prevState: UpdateQuestionState,
  formData: FormData,
): Promise<UpdateQuestionState> {
  const { supabase } = await requireRole("admin");

  const questionId = String(formData.get("question_id") ?? "");
  const setId = String(formData.get("set_id") ?? "");
  const stem = String(formData.get("stem") ?? "").trim();
  const options = [0, 1, 2, 3].map((i) => String(formData.get(`option_${i}`) ?? "").trim());
  const reasons = [0, 1, 2, 3].map((i) => String(formData.get(`reason_${i}`) ?? "").trim());
  const correctOption = Number(formData.get("correct_option"));
  const correctReason = Number(formData.get("correct_reason"));

  if (!questionId || !stem || options.some((o) => !o) || reasons.some((r) => !r)) {
    return { error: "Semua kolom wajib diisi." };
  }
  if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption > 3) {
    return { error: "Pilih opsi jawaban yang benar." };
  }
  if (!Number.isInteger(correctReason) || correctReason < 0 || correctReason > 3) {
    return { error: "Pilih opsi alasan yang benar." };
  }

  const { error } = await supabase
    .from("questions")
    .update({
      stem,
      options,
      reasons,
      correct_option: correctOption,
      correct_reason: correctReason,
    })
    .eq("id", questionId);

  if (error) {
    return { error: `Gagal menyimpan: ${error.message}` };
  }

  revalidatePath(`/admin/sets/${setId}`);
  return { success: true };
}

export async function togglePublish(formData: FormData) {
  const { supabase } = await requireRole("admin");

  const setId = String(formData.get("set_id") ?? "");
  const next = formData.get("next") === "true";

  await supabase.from("question_sets").update({ published: next }).eq("id", setId);

  revalidatePath(`/admin/sets/${setId}`);
  revalidatePath("/admin/sets");
}
