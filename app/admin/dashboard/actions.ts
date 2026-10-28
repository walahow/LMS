"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

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

  // Pure Mock Mode for UI/UX review: create and redirect directly
  redirect("/admin/dashboard");
}

export type GenerateAIResult = {
  isLive: boolean;
  questions?: Array<{
    stem: string;
    options: string[];
    correct_option: number;
    reasons: string[];
    correct_reason: number;
  }>;
  error?: string;
};

/**
 * Pure 100% Mock AI Generator for UI/UX review:
 * Zero external API calls, zero quota limits, zero 503 errors.
 */
export async function generateAIQuestionsAction(params: {
  indicator: string;
  subject?: string;
  grade?: string;
  count: number;
  difficulty: "mudah" | "sedang" | "sulit";
}): Promise<GenerateAIResult> {
  // Pure 100% Mock Mode
  return { isLive: false };
}
