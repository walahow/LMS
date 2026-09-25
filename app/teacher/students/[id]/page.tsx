import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { diagnose, DIAGNOSIS_BADGE_CLASS, DIAGNOSIS_LABEL } from "@/lib/diagnose";

const links = [
  { href: "/teacher/dashboard", label: "Beranda" },
  { href: "/teacher/profile", label: "Profil" },
];

const NIL_ID = "00000000-0000-0000-0000-000000000000";

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireRole("teacher");

  const { data: student } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", id)
    .eq("role", "student")
    .single();

  if (!student) notFound();

  const { data: attempts } = await supabase
    .from("attempts")
    .select("id, set_id, started_at, submitted_at")
    .eq("student_id", id)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  const setIds = [...new Set((attempts ?? []).map((a) => a.set_id))];
  const { data: sets } = await supabase
    .from("question_sets")
    .select("id, title")
    .in("id", setIds.length ? setIds : [NIL_ID]);
  const titleBySetId = new Map((sets ?? []).map((s) => [s.id, s.title]));

  const attemptIds = (attempts ?? []).map((a) => a.id);
  const { data: responses } = await supabase
    .from("responses")
    .select("attempt_id, question_id, answer, reason, confident")
    .in("attempt_id", attemptIds.length ? attemptIds : [NIL_ID]);

  const questionIds = [...new Set((responses ?? []).map((r) => r.question_id))];
  const { data: questions } = await supabase
    .from("questions")
    .select("id, position, stem, options, reasons, correct_option, correct_reason")
    .in("id", questionIds.length ? questionIds : [NIL_ID]);
  const questionById = new Map((questions ?? []).map((q) => [q.id, q]));

  const responsesByAttempt = new Map<string, NonNullable<typeof responses>>();
  for (const r of responses ?? []) {
    const list = responsesByAttempt.get(r.attempt_id) ?? [];
    list.push(r);
    responsesByAttempt.set(r.attempt_id, list);
  }

  return (
    <AppShell title="LMS Diagnostik — Guru" fullName={profile.full_name} links={links}>
      <h1>{student.full_name}</h1>

      {(attempts ?? []).length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>Belum ada tes yang diselesaikan.</p>
      )}

      {(attempts ?? []).map((attempt) => {
        const attemptResponses = (responsesByAttempt.get(attempt.id) ?? [])
          .map((r) => ({ response: r, question: questionById.get(r.question_id) }))
          .filter((x) => x.question)
          .sort((a, b) => a.question!.position - b.question!.position);

        return (
          <div key={attempt.id} className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>
              {titleBySetId.get(attempt.set_id) ?? "Set Soal"}
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginTop: "-0.5rem" }}>
              Diselesaikan: {new Date(attempt.submitted_at!).toLocaleString("id-ID")}
            </p>

            {attemptResponses.map(({ response, question }, index) => {
              const q = question!;
              const result = diagnose(response, q);
              return (
                <div
                  key={response.question_id}
                  style={{ borderTop: "1px solid var(--color-border)", padding: "0.75rem 0" }}
                >
                  <p style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
                    {index + 1}. {q.stem}
                  </p>
                  <p style={{ margin: "0.15rem 0", fontSize: "0.9rem" }}>
                    Jawaban: {q.options[response.answer]}{" "}
                    {response.answer === q.correct_option ? "✓" : "✗"}
                  </p>
                  <p style={{ margin: "0.15rem 0", fontSize: "0.9rem" }}>
                    Alasan: {q.reasons[response.reason]}{" "}
                    {response.reason === q.correct_reason ? "✓" : "✗"}
                  </p>
                  <p style={{ margin: "0.15rem 0", fontSize: "0.9rem" }}>
                    Keyakinan: {response.confident ? "Yakin" : "Tidak yakin"}
                  </p>
                  <span className={`badge ${DIAGNOSIS_BADGE_CLASS[result]}`}>{DIAGNOSIS_LABEL[result]}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </AppShell>
  );
}
