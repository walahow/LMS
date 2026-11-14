import { notFound } from "next/navigation";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { fetchAdminSetDetail } from "@/lib/admin-data";
import { QuestionEditor } from "./QuestionEditor";
import { PublishToggleButton } from "./PublishToggleButton";
import { ExportExcelButton } from "@/components/ExportExcelButton";

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
                  position: "relative",
                  zIndex: 2,
                  isolation: "isolate",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  border: "1.5px solid",
                  borderColor: set.published ? "var(--color-accent)" : "var(--color-border)",
                  backgroundColor: set.published ? "var(--color-surface)" : "var(--color-bg)",
                  color: set.published ? "var(--color-accent)" : "var(--color-text-muted)",
                  boxShadow: set.published ? "0 1px 3px rgba(17, 106, 248, 0.18)" : "none",
                }}
              >
                {set.published ? "✓ DITERBITKAN" : "✎ DRAF"}
              </span>
            </div>

            {/* Toggle Publish & Excel Export actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <ExportExcelButton setId={set.id} scope="admin" variant="compact" label="⬇ EXCEL (.XLSX)" />
              <PublishToggleButton setId={set.id} published={set.published} />
            </div>
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

        {/* Database migration 0005 missing notice */}
        {set.missingQuestionMetadataColumns && (
          <section
            style={{
              padding: "14px 16px",
              border: "1.5px solid #D97706",
              backgroundColor: "rgba(217, 119, 6, 0.1)",
              color: "var(--color-text)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span className="font-mono" style={{ fontSize: "11.5px", fontWeight: 800, color: "#B45309" }}>
              ⚠ KOLOM INDIKATOR PER SOAL BELUM ADA DI DATABASE SUPABASE
            </span>
            <p style={{ fontSize: "12px", lineHeight: 1.5, margin: 0 }}>
              Kolom <code>indicator</code>, <code>subtopic</code>, dan <code>cognitive_level</code> pada tabel{" "}
              <code>questions</code> belum ditambahkan di Supabase, sehingga indikator per nomor belum bisa ditampilkan
              atau disimpan. Jalankan SQL dari <code>supabase/migrations/0005_question_indicator.sql</code> (dan{" "}
              <code>0004_profile_grade_username.sql</code>) di Supabase SQL Editor, lalu jalankan{" "}
              <code>node scripts/import-customer-packs.mjs</code>.
            </p>
          </section>
        )}

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
