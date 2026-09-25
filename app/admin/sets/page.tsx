import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

const links = [
  { href: "/admin/dashboard", label: "Beranda" },
  { href: "/admin/sets", label: "Set Soal" },
  { href: "/admin/users", label: "Pengguna" },
];

export default async function AdminSetsPage() {
  const { supabase, profile } = await requireRole("admin");

  const { data: sets } = await supabase
    .from("question_sets")
    .select("id, title, indicator, subject, grade, published, created_at")
    .order("created_at", { ascending: false });

  return (
    <AppShell title="LMS Diagnostik — Admin" fullName={profile.full_name} links={links}>
      <h1>Set Soal</h1>

      <div className="card">
        {sets && sets.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "0.5rem" }}>Judul</th>
                  <th style={{ padding: "0.5rem" }}>Indikator</th>
                  <th style={{ padding: "0.5rem" }}>Status</th>
                  <th style={{ padding: "0.5rem" }}></th>
                </tr>
              </thead>
              <tbody>
                {sets.map((set) => (
                  <tr key={set.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "0.5rem" }}>{set.title}</td>
                    <td style={{ padding: "0.5rem", color: "var(--color-text-muted)" }}>
                      {set.indicator}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <span className={`badge ${set.published ? "badge-success" : "badge-warning"}`}>
                        {set.published ? "Diterbitkan" : "Draf"}
                      </span>
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <Link href={`/admin/sets/${set.id}`} className="btn btn-secondary">
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "var(--color-text-muted)" }}>
            Belum ada set soal. Buat satu dari halaman Beranda.
          </p>
        )}
      </div>
    </AppShell>
  );
}
