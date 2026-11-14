/**
 * Pure authentication & input sanitization helpers.
 * Kept in a non-"use server" module so they can be imported
 * by client components and tests without Server Action constraints.
 */

export function sanitizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
}

/**
 * Detects PostgREST / Postgres errors caused by unapplied optional column
 * migrations (e.g. `grade` or `username` on `profiles`) so queries/upserts
 * can gracefully fall back to base columns + auth `user_metadata`.
 */
export function isMissingColumnError(
  err: { message?: string; code?: string } | null | undefined,
): boolean {
  if (!err) return false;
  if (err.code === "PGRST204" || err.code === "42703") return true;
  const msg = (err.message ?? "").toLowerCase();
  return msg.includes("schema cache") || (msg.includes("column") && msg.includes("does not exist"));
}
