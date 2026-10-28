import { notFound } from "next/navigation";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { fetchAdminSetDetail } from "@/lib/admin-data";
import { QuestionEditor } from "./QuestionEditor";
import { togglePublish } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const set = await fetchAdminSetDetail(id);

  if (!set) {
    notFound();
  }

  const questions = set.questions ?? [];

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Sticky Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          backgroundColor: "var(--color-surface)",
          borderBottom: "1.5px solid var(--color-border)",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          {/* Back button */}
          <Link
            href="/admin/dashboard"
            className="boxy-pressable-sm font-mono"
            style={{
              textDecoration: "none",
              padding: "6px 12px",
              fontSize: "11.5px",
              fontWeight: 800,
              border: "1.5px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>❮</span>
            <span>KEMBALI KE ADMIN HUB</span>
          </Link>

          {/* Theme Toggler */}
          <ThemeToggler />
        </div>
      </header>

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          padding: "20px 16px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Set Header Card */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="dither-fade-right" aria-hidden="true" />
          {/* Top badges & Toggle Publish Form */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              borderBottom: "1.5px solid var(--color-border)",
              paddingBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span
                className="badge-mono"
                style={{
                  backgroundColor: "var(--color-text)",
                  color: "var(--color-surface)",
                  fontSize: "10.5px",
                }}
              >
                • {set.subject.toUpperCase()}
              </span>
              <span className="badge-mono" style={{ fontSize: "10.5px" }}>
                {set.grade}
              </span>
              <span className="badge-mono" style={{ fontSize: "10.5px" }}>
                {questions.length} BUTIR SOAL
              </span>
              <span
                className="badge-mono"
                style={{
                  fontSize: "10.5px",
                  borderColor: set.published ? "#16A34A" : "var(--color-border)",
                  backgroundColor: set.published ? "rgba(22, 163, 74, 0.1)" : "var(--color-bg)",
                  color: set.published ? "#16A34A" : "var(--color-text-muted)",
                }}
              >
                {set.published ? "✓ DITERBITKAN" : "✎ DRAF"}
              </span>
            </div>

            {/* Toggle Publish action */}
            <form action={togglePublish}>
              <input type="hidden" name="set_id" value={set.id} />
              <input type="hidden" name="next" value={(!set.published).toString()} />
              <button
                type="submit"
                className="boxy-pressable-sm font-mono"
                style={{
                  padding: "7px 14px",
                  fontSize: "11px",
                  fontWeight: 800,
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: set.published
                    ? "var(--color-surface)"
                    : "var(--color-accent)",
                  color: set.published
                    ? "var(--color-text)"
                    : "var(--color-accent-contrast)",
                  cursor: "pointer",
                }}
              >
                {set.published ? "JADIKAN DRAF" : "TERBITKAN KE SISWA ➔"}
              </button>
            </form>
          </div>

          {/* Title & Indicator */}
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 900,
                color: "var(--color-text)",
                margin: "0 0 6px",
              }}
            >
              {set.title}
            </h1>
            <p
              style={{
                fontSize: "12.5px",
                color: "var(--color-text-muted)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {set.indicator}
            </p>
          </div>
        </section>

        {/* Question Editors List */}
        <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              className="font-mono"
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "var(--color-text)",
              }}
            >
              DAFTAR SOAL 3-TIER ({questions.length})
            </span>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
              Perubahan disimpan per nomor soal
            </span>
          </div>

          {questions.map((q, index) => (
            <QuestionEditor
              key={q.id}
              setId={set.id}
              question={q}
              index={index}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
