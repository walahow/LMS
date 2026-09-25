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
  paham: "Paham Konsep",
  lucky_guess: "Lucky Guess",
  miskonsepsi: "Miskonsepsi",
  tidak_paham: "Tidak Paham Konsep",
};

export const DIAGNOSIS_BADGE_CLASS: Record<Diagnosis, string> = {
  paham: "badge-success",
  lucky_guess: "badge-info",
  miskonsepsi: "badge-danger",
  tidak_paham: "badge-warning",
};
