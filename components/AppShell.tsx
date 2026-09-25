import Link from "next/link";
import { signOut } from "@/lib/auth-actions";

export function AppShell({
  title,
  fullName,
  links,
  children,
}: {
  title: string;
  fullName: string;
  links: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <strong className="brand">{title}</strong>
            <nav style={{ display: "flex", gap: "1rem" }}>
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>{fullName}</span>
            <form action={signOut}>
              <button className="btn btn-secondary" type="submit">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>
      <main style={{ flex: 1, width: "100%", maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>
        {children}
      </main>
    </div>
  );
}
