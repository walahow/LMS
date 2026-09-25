import { requireRole } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { GenerateForm } from "./GenerateForm";

const links = [
  { href: "/admin/dashboard", label: "Beranda" },
  { href: "/admin/sets", label: "Set Soal" },
  { href: "/admin/users", label: "Pengguna" },
];

export default async function AdminDashboardPage() {
  const { profile } = await requireRole("admin");

  return (
    <AppShell title="LMS Diagnostik — Admin" fullName={profile.full_name} links={links}>
      <h1>Buat Set Soal Baru</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Masukkan indikator pembelajaran, AI akan membuat draf soal untuk ditinjau sebelum
        diterbitkan.
      </p>
      <div className="card">
        <GenerateForm />
      </div>
    </AppShell>
  );
}
