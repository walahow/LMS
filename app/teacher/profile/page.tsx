import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

const links = [
  { href: "/teacher/dashboard", label: "Beranda" },
  { href: "/teacher/profile", label: "Profil" },
];

export default async function TeacherProfilePage() {
  const { profile } = await requireRole("teacher");

  return (
    <AppShell title="LMS Diagnostik — Guru" fullName={profile.full_name} links={links}>
      <h1>Profil</h1>
      <p style={{ color: "var(--color-text-muted)" }}>{profile.full_name}</p>
      <ChangePasswordForm />
    </AppShell>
  );
}
