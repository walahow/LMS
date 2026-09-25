import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreateUserForm } from "./CreateUserForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

const links = [
  { href: "/admin/dashboard", label: "Beranda" },
  { href: "/admin/users", label: "Pengguna" },
];

export default async function AdminUsersPage() {
  const { profile } = await requireRole("admin");

  const admin = createAdminClient();
  const [{ data: profiles }, { data: authUsers }] = await Promise.all([
    admin.from("profiles").select("id, role, full_name").order("full_name"),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  const emailById = new Map(authUsers?.users.map((u) => [u.id, u.email ?? ""]));
  const rows = (profiles ?? []).map((p) => ({ ...p, email: emailById.get(p.id) ?? "" }));

  return (
    <AppShell title="LMS Diagnostik — Admin" fullName={profile.full_name} links={links}>
      <h1>Pengguna</h1>

      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Tambah Pengguna</h2>
        <CreateUserForm />
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Daftar Pengguna</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ padding: "0.5rem" }}>Nama</th>
                <th style={{ padding: "0.5rem" }}>Email</th>
                <th style={{ padding: "0.5rem" }}>Peran</th>
                <th style={{ padding: "0.5rem" }}>Reset Kata Sandi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.5rem" }}>{row.full_name}</td>
                  <td style={{ padding: "0.5rem" }}>{row.email}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <span className="badge badge-info">{row.role}</span>
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <ResetPasswordForm userId={row.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
