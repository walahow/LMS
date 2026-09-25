import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

const links = [
  { href: "/teacher/dashboard", label: "Beranda" },
  { href: "/teacher/profile", label: "Profil" },
];

export default async function TeacherDashboardPage() {
  const { profile } = await requireRole("teacher");

  return (
    <AppShell title="LMS Diagnostik — Guru" fullName={profile.full_name} links={links}>
      <h1>Selamat datang, {profile.full_name}</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Daftar siswa dan ringkasan diagnosis akan muncul di sini.
      </p>
    </AppShell>
  );
}
