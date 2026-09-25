import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { diagnose, type Diagnosis } from "@/lib/diagnose";

const links = [
  { href: "/teacher/dashboard", label: "Beranda" },
  { href: "/teacher/profile", label: "Profil" },
];

const emptyCounts = (): Record<Diagnosis, number> => ({
  paham: 0,
  lucky_guess: 0,
  miskonsepsi: 0,
  tidak_paham: 0,
});

export default async function TeacherDashboardPage() {
  const { supabase, profile } = await requireRole("teacher");

  const [{ data: students }, { data: attempts }, { data: responses }, { data: questions }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name").eq("role", "student").order("full_name"),
      supabase.from("attempts").select("id, student_id").not("submitted_at", "is", null),
      supabase.from("responses").select("attempt_id, question_id, answer, reason, confident"),
      supabase.from("questions").select("id, correct_option, correct_reason"),
    ]);

  const questionById = new Map((questions ?? []).map((q) => [q.id, q]));
  const studentIdByAttempt = new Map((attempts ?? []).map((a) => [a.id, a.student_id]));
  const submittedAttemptIds = new Set((attempts ?? []).map((a) => a.id));

  const countsByStudent = new Map<string, Record<Diagnosis, number>>();
  const completedByStudent = new Map<string, Set<string>>();

  for (const r of responses ?? []) {
    if (!submittedAttemptIds.has(r.attempt_id)) continue;
    const question = questionById.get(r.question_id);
    const studentId = studentIdByAttempt.get(r.attempt_id);
    if (!question || !studentId) continue;

    const diagnosis = diagnose(r, question);
    const counts = countsByStudent.get(studentId) ?? emptyCounts();
    counts[diagnosis] += 1;
    countsByStudent.set(studentId, counts);

    const attemptsSet = completedByStudent.get(studentId) ?? new Set<string>();
    attemptsSet.add(r.attempt_id);
    completedByStudent.set(studentId, attemptsSet);
  }

  return (
    <AppShell title="LMS Diagnostik — Guru" fullName={profile.full_name} links={links}>
      <h1>Siswa</h1>

      <div className="card">
        {students && students.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "0.5rem" }}>Nama</th>
                  <th style={{ padding: "0.5rem" }}>Tes Selesai</th>
                  <th style={{ padding: "0.5rem" }}>Paham</th>
                  <th style={{ padding: "0.5rem" }}>Miskonsepsi</th>
                  <th style={{ padding: "0.5rem" }}>Tidak Paham</th>
                  <th style={{ padding: "0.5rem" }}>Lucky Guess</th>
                  <th style={{ padding: "0.5rem" }}></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const counts = countsByStudent.get(student.id) ?? emptyCounts();
                  const completed = completedByStudent.get(student.id)?.size ?? 0;
                  return (
                    <tr key={student.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "0.5rem" }}>{student.full_name}</td>
                      <td style={{ padding: "0.5rem" }}>{completed}</td>
                      <td style={{ padding: "0.5rem" }}>{counts.paham}</td>
                      <td style={{ padding: "0.5rem" }}>{counts.miskonsepsi}</td>
                      <td style={{ padding: "0.5rem" }}>{counts.tidak_paham}</td>
                      <td style={{ padding: "0.5rem" }}>{counts.lucky_guess}</td>
                      <td style={{ padding: "0.5rem" }}>
                        <Link href={`/teacher/students/${student.id}`} className="btn btn-secondary">
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "var(--color-text-muted)" }}>Belum ada siswa.</p>
        )}
      </div>
    </AppShell>
  );
}
