import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

const links = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/history", label: "Riwayat" },
  { href: "/profile", label: "Profil" },
];

export default async function StudentDashboardPage() {
  const { profile } = await requireRole("student");

  return (
    <AppShell title="LMS Diagnostik" fullName={profile.full_name} links={links}>
      <h1>Selamat datang, {profile.full_name}</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Daftar tes yang tersedia akan muncul di sini.
      </p>
    </AppShell>
  );
}
