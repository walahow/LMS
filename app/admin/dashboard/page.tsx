import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

const links = [
  { href: "/admin/dashboard", label: "Beranda" },
  { href: "/admin/users", label: "Pengguna" },
];

export default async function AdminDashboardPage() {
  const { profile } = await requireRole("admin");

  return (
    <AppShell title="LMS Diagnostik — Admin" fullName={profile.full_name} links={links}>
      <h1>Selamat datang, {profile.full_name}</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Pembuatan set soal dengan AI akan tersedia di sini.
      </p>
    </AppShell>
  );
}
