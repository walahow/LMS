import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { QuizQuestion } from "./QuizQuestion";

const links = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/history", label: "Riwayat" },
  { href: "/profile", label: "Profil" },
];

export default async function QuizPage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const { supabase, user, profile } = await requireRole("student");

  const { data: set } = await supabase
    .from("question_sets")
    .select("id, title, published")
    .eq("id", setId)
    .single();

  if (!set || !set.published) notFound();

  let attempt = (
    await supabase
      .from("attempts")
      .select("id, submitted_at")
      .eq("student_id", user.id)
      .eq("set_id", setId)
      .is("submitted_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ).data;

  if (!attempt) {
    const { data: created, error } = await supabase
      .from("attempts")
      .insert({ student_id: user.id, set_id: setId })
      .select("id, submitted_at")
      .single();
    if (error || !created) {
      throw new Error(`Gagal memulai percobaan: ${error?.message ?? "unknown error"}`);
    }
    attempt = created;
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("id, set_id, position, stem, options, reasons")
    .eq("set_id", setId)
    .order("position");

  const { data: responses } = await supabase
    .from("responses")
    .select("question_id")
    .eq("attempt_id", attempt.id);

  const answeredIds = new Set((responses ?? []).map((r) => r.question_id));
  const all = questions ?? [];
  const remaining = all.filter((q) => !answeredIds.has(q.id));

  if (remaining.length === 0) {
    await supabase
      .from("attempts")
      .update({ submitted_at: new Date().toISOString() })
      .eq("id", attempt.id);
    redirect("/dashboard?selesai=1");
  }

  const current = remaining[0];
  const answeredCount = all.length - remaining.length;

  return (
    <AppShell title="LMS Diagnostik" fullName={profile.full_name} links={links}>
      <h1 style={{ marginBottom: "0.25rem" }}>{set.title}</h1>
      <p style={{ color: "var(--color-text-muted)", marginTop: 0, marginBottom: "1.5rem" }}>
        Soal {answeredCount + 1} dari {all.length}
      </p>
      <QuizQuestion attemptId={attempt.id} setId={setId} question={current} />
    </AppShell>
  );
}
