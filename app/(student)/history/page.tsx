export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ThemeToggler } from "@/components/ThemeToggler";

const NIL_ID = "00000000-0000-0000-0000-000000000000";

export default async function StudentHistoryPage() {
  const { supabase, user } = await requireRole("student");

  const { data: attempts } = await supabase
    .from("attempts")
    .select("id, set_id, submitted_at")
    .eq("student_id", user.id)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  const setIds = [...new Set((attempts ?? []).map((a) => a.set_id))];
  const { data: sets } = await supabase
    .from("question_sets")
    .select("id, title, subject, grade")
    .in("id", setIds.length ? setIds : [NIL_ID]);

  const setById = new Map((sets ?? []).map((s) => [s.id, s]));

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* 1. Sticky Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          backgroundColor: "var(--color-bg)",
          borderBottom: "1.5px solid var(--color-border)",
          display: "flex",
          justifyContent: "center",
          padding: "10px 12px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <Link
            href="/dashboard"
            className="font-mono boxy-btn boxy-pressable-sm"
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 800,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ❮ KEMBALI
          </Link>

          <span
            className="font-mono"
            style={{
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.04em",
              color: "var(--color-text)",
            }}
          >
            RIWAYAT TES SISWA
          </span>

          <ThemeToggler />
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "20px 14px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "var(--color-accent)",
              textTransform: "uppercase",
            }}
          >
            REKAP PENGERJAAN
          </span>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "-0.01em",
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Daftar Tes yang Telah Selesai
          </h1>
        </div>

        {attempts && attempts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {attempts.map((attempt) => {
              const setInfo = setById.get(attempt.set_id);
              const dateStr = new Date(attempt.submitted_at!).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={attempt.id}
                  className="boxy-card-flat"
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="badge-mono font-mono" style={{ fontSize: "10px" }}>
                          {setInfo?.subject || "TES"}
                        </span>
                        <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                          {dateStr}
                        </span>
                      </div>
                      <h2
                        style={{
                          fontSize: "15px",
                          fontWeight: 800,
                          color: "var(--color-text)",
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {setInfo?.title ?? "Paket Soal"}
                      </h2>
                    </div>
                  </div>

                  <Link
                    href={`/history/${attempt.id}`}
                    className="boxy-btn boxy-btn-accent font-mono boxy-pressable-sm"
                    style={{
                      height: "38px",
                      fontSize: "12px",
                      fontWeight: 800,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    ULAS JAWABAN LENGKAP ➔
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="boxy-card-flat"
            style={{
              padding: "36px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span style={{ fontSize: "32px" }}>📝</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span className="font-mono" style={{ fontSize: "14px", fontWeight: 800, color: "var(--color-text)" }}>
                Belum ada tes yang diselesaikan
              </span>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                Kerjakan salah satu paket tes diagnostik dari beranda untuk melihat riwayat evaluasi.
              </span>
            </div>
            <Link
              href="/dashboard"
              className="boxy-btn boxy-btn-accent font-mono boxy-pressable-sm"
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 800,
                textDecoration: "none",
                marginTop: "4px",
              }}
            >
              KE BERANDA SISWA ➔
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
