import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

const links = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/history", label: "Riwayat" },
  { href: "/profile", label: "Profil" },
];

export default async function StudentProfilePage() {
  const { profile } = await requireRole("student");

  return (
    <AppShell title="LMS Diagnostik" fullName={profile.full_name} links={links}>
      <h1>Profil</h1>
      <p style={{ color: "var(--color-text-muted)" }}>{profile.full_name}</p>
      <ChangePasswordForm />
    </AppShell>
  );
}
