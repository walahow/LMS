import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

const links = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/history", label: "Riwayat" },
  { href: "/profile", label: "Profil" },
];

const NIL_ID = "00000000-0000-0000-0000-000000000000";

export default async function StudentHistoryPage() {
  const { supabase, user, profile } = await requireRole("student");

  const { data: attempts } = await supabase
    .from("attempts")
    .select("id, set_id, submitted_at")
    .eq("student_id", user.id)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  const setIds = [...new Set((attempts ?? []).map((a) => a.set_id))];
  const { data: sets } = await supabase
    .from("question_sets")
    .select("id, title")
    .in("id", setIds.length ? setIds : [NIL_ID]);
  const titleBySetId = new Map((sets ?? []).map((s) => [s.id, s.title]));

  return (
    <AppShell title="LMS Diagnostik" fullName={profile.full_name} links={links}>
      <h1>Riwayat</h1>
      <div className="card">
        {attempts && attempts.length > 0 ? (
          attempts.map((attempt) => (
            <div
              key={attempt.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {titleBySetId.get(attempt.set_id) ?? "Set Soal"}
                </p>
                <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  {new Date(attempt.submitted_at!).toLocaleString("id-ID")}
                </p>
              </div>
              <Link href={`/history/${attempt.id}`} className="btn btn-secondary">
                Lihat
              </Link>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--color-text-muted)" }}>Belum ada tes yang diselesaikan.</p>
        )}
      </div>
    </AppShell>
  );
}
