/**
 * The diagnosis is computed, never stored (docs/PLAN.md §2). `responses`
 * holds only the three raw choices; this pure function derives the
 * classification at read time so a rubric revision never requires a data
 * migration.
 */

export type Diagnosis = "paham" | "lucky_guess" | "miskonsepsi" | "tidak_paham";

export function diagnose(
  r: { answer: number; reason: number; confident: boolean },
  q: { correct_option: number; correct_reason: number },
): Diagnosis {
  const okAnswer = r.answer === q.correct_option;
  const okReason = r.reason === q.correct_reason;
  if (!r.confident) return okAnswer && okReason ? "lucky_guess" : "tidak_paham";
  return okAnswer && okReason ? "paham" : "miskonsepsi";
}

export const DIAGNOSIS_LABEL: Record<Diagnosis, string> = {
  paham: "Memahami konsep",
  lucky_guess: "Menebak konsep",
  miskonsepsi: "Miskonsepsi",
  tidak_paham: "Tidak memahami konsep",
};

export const DIAGNOSIS_SHORT_LABEL: Record<Diagnosis, string> = {
  paham: "MEMAHAMI",
  lucky_guess: "MENEBAK",
  miskonsepsi: "MISK",
  tidak_paham: "TDK PAHAM",
};

export const DIAGNOSIS_BADGE_CLASS: Record<Diagnosis, string> = {
  paham: "badge-success",
  lucky_guess: "badge-info",
  miskonsepsi: "badge-danger",
  tidak_paham: "badge-warning",
};

/**
 * Unified 0–100 numeric score: calculated strictly from Tier-1 answer accuracy.
 * Tier 2 (reason) and Tier 3 (confidence) drive the diagnostic category without
 * altering the numeric score.
 */
export function calculateTier1Score(
  items: ReadonlyArray<{ answer: number | null | undefined; correctOption: number }>,
  totalQuestions?: number,
): number {
  const denom = totalQuestions ?? items.length;
  if (denom <= 0) return 0;
  const correctTier1 = items.filter((item) => item.answer === item.correctOption).length;
  return Math.round((correctTier1 / denom) * 100);
}
