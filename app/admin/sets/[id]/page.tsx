import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { QuestionEditor } from "./QuestionEditor";
import { togglePublish } from "./actions";

const links = [
  { href: "/admin/dashboard", label: "Beranda" },
  { href: "/admin/sets", label: "Set Soal" },
  { href: "/admin/users", label: "Pengguna" },
];

export default async function AdminSetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireRole("admin");

  const { data: set } = await supabase
    .from("question_sets")
    .select("id, title, indicator, subject, grade, published")
    .eq("id", id)
    .single();

  if (!set) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("id, set_id, position, stem, options, correct_option, reasons, correct_reason")
    .eq("set_id", id)
    .order("position");

  return (
    <AppShell title="LMS Diagnostik — Admin" fullName={profile.full_name} links={links}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>{set.title}</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 0 }}>{set.indicator}</p>
        </div>
        <form action={togglePublish}>
          <input type="hidden" name="set_id" value={set.id} />
          <input type="hidden" name="next" value={(!set.published).toString()} />
          <button className={set.published ? "btn btn-secondary" : "btn"} type="submit">
            {set.published ? "Batalkan Publikasi" : "Terbitkan"}
          </button>
        </form>
      </div>

      <span className={`badge ${set.published ? "badge-success" : "badge-warning"}`} style={{ marginBottom: "1.5rem", display: "inline-block" }}>
        {set.published ? "Diterbitkan" : "Draf"}
      </span>

      {(questions ?? []).map((question, index) => (
        <QuestionEditor key={question.id} setId={set.id} question={question} index={index} />
      ))}
    </AppShell>
  );
}
