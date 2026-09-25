import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

const links = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/history", label: "Riwayat" },
  { href: "/profile", label: "Profil" },
];

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ selesai?: string }>;
}) {
  const { selesai } = await searchParams;
  const { supabase, user, profile } = await requireRole("student");

  const { data: sets } = await supabase
    .from("question_sets")
    .select("id, title, indicator, subject, grade")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const { data: inProgress } = await supabase
    .from("attempts")
    .select("set_id")
    .eq("student_id", user.id)
    .is("submitted_at", null);

  const inProgressSetIds = new Set((inProgress ?? []).map((a) => a.set_id));

  return (
    <AppShell title="LMS Diagnostik" fullName={profile.full_name} links={links}>
      <h1>Selamat datang, {profile.full_name}</h1>

      {selesai === "1" && (
        <p className="badge badge-success" style={{ marginBottom: "1rem" }}>
          Tes selesai. Terima kasih!
        </p>
      )}

      <div className="card">
        {sets && sets.length > 0 ? (
          sets.map((set) => (
            <div
              key={set.id}
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
                <p style={{ margin: 0, fontWeight: 600 }}>{set.title}</p>
                <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  {[set.subject, set.grade].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Link href={`/quiz/${set.id}`} className="btn">
                {inProgressSetIds.has(set.id) ? "Lanjutkan" : "Mulai"}
              </Link>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--color-text-muted)" }}>Belum ada tes yang tersedia.</p>
        )}
      </div>
    </AppShell>
  );
}
