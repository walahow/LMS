import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { diagnose, DIAGNOSIS_BADGE_CLASS, DIAGNOSIS_LABEL } from "@/lib/diagnose";

const links = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/history", label: "Riwayat" },
  { href: "/profile", label: "Profil" },
];

const NIL_ID = "00000000-0000-0000-0000-000000000000";

export default async function StudentHistoryAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const { supabase, user, profile } = await requireRole("student");

  const { data: attempt } = await supabase
    .from("attempts")
    .select("id, set_id, student_id, submitted_at")
    .eq("id", attemptId)
    .single();

  if (!attempt || attempt.student_id !== user.id || !attempt.submitted_at) notFound();

  const { data: set } = await supabase
    .from("question_sets")
    .select("title")
    .eq("id", attempt.set_id)
    .single();

  const { data: responses } = await supabase
    .from("responses")
    .select("question_id, answer, reason, confident")
    .eq("attempt_id", attemptId);

  const questionIds = (responses ?? []).map((r) => r.question_id);
  const { data: questions } = await supabase
    .from("questions")
    .select("id, position, stem, options, reasons, correct_option, correct_reason")
    .in("id", questionIds.length ? questionIds : [NIL_ID]);
  const questionById = new Map((questions ?? []).map((q) => [q.id, q]));

  const rows = (responses ?? [])
    .map((r) => ({ response: r, question: questionById.get(r.question_id) }))
    .filter((x) => x.question)
    .sort((a, b) => a.question!.position - b.question!.position);

  return (
    <AppShell title="LMS Diagnostik" fullName={profile.full_name} links={links}>
      <h1>{set?.title ?? "Set Soal"}</h1>
      <div className="card">
        {rows.map(({ response, question }, index) => {
          const q = question!;
          const result = diagnose(response, q);
          return (
            <div
              key={response.question_id}
              style={{
                borderTop: index === 0 ? "none" : "1px solid var(--color-border)",
                padding: "0.75rem 0",
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
                {index + 1}. {q.stem}
              </p>
              <p style={{ margin: "0.15rem 0", fontSize: "0.9rem" }}>
                Jawaban Anda: {q.options[response.answer]}{" "}
                {response.answer === q.correct_option ? "✓" : "✗"}
              </p>
              {response.answer !== q.correct_option && (
                <p style={{ margin: "0.15rem 0", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                  Jawaban benar: {q.options[q.correct_option]}
                </p>
              )}
              <p style={{ margin: "0.15rem 0", fontSize: "0.9rem" }}>
                Alasan Anda: {q.reasons[response.reason]}{" "}
                {response.reason === q.correct_reason ? "✓" : "✗"}
              </p>
              {response.reason !== q.correct_reason && (
                <p style={{ margin: "0.15rem 0", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                  Alasan benar: {q.reasons[q.correct_reason]}
                </p>
              )}
              <span className={`badge ${DIAGNOSIS_BADGE_CLASS[result]}`}>{DIAGNOSIS_LABEL[result]}</span>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
