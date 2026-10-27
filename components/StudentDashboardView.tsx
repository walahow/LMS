"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { ProfileDropdown } from "@/components/ProfileDropdown";

export type DashboardSet = {
  id: string;
  title: string;
  indicator: string;
  subject: string;
  grade?: string | null;
  totalQuestions: number;
  status: "not_started" | "in_progress" | "completed";
  progressCount?: number;
  score?: number | null;
  lastAttemptId?: string;
};

export type StudentProfileInfo = {
  fullName: string;
  initials: string;
  email?: string;
  grade?: string;
};

export type StudentStats = {
  completedSets: number;
  totalSets: number;
  averageScore: number;
  pendingSets: number;
};

const SUBJECT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  FISIKA: { bg: "rgba(255, 40, 0, 0.10)", text: "var(--color-accent)", dot: "#FF2800" },
  BIOLOGI: { bg: "rgba(14, 164, 122, 0.12)", text: "#0B6B50", dot: "#0EA47A" },
  KIMIA: { bg: "rgba(245, 165, 36, 0.14)", text: "#8A5200", dot: "#F5A524" },
  GEOGRAFI: { bg: "rgba(11, 127, 212, 0.12)", text: "#065A96", dot: "#0B7FD4" },
};

function getSubjectBadge(subject: string) {
  const norm = subject.toUpperCase();
  return (
    SUBJECT_COLORS[norm] || {
      bg: "var(--color-surface-dim)",
      text: "var(--color-text)",
      dot: "var(--color-text-muted)",
    }
  );
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "Selamat pagi,";
  if (hour >= 11 && hour < 15) return "Selamat siang,";
  if (hour >= 15 && hour < 18) return "Selamat sore,";
  return "Selamat malam,";
}

export function StudentDashboardView({
  profile,
  stats,
  sets,
  showCelebrationAlert = false,
}: {
  profile: StudentProfileInfo;
  stats: StudentStats;
  sets: DashboardSet[];
  showCelebrationAlert?: boolean;
}) {
  const [selectedSubject, setSelectedSubject] = useState<string>("SEMUA");
  const [showAlert, setShowAlert] = useState<boolean>(showCelebrationAlert);

  // Extract distinct subjects
  const availableSubjects = useMemo(() => {
    const list = Array.from(new Set(sets.map((s) => s.subject.toUpperCase()))).filter(Boolean);
    return ["SEMUA", ...list];
  }, [sets]);

  // Find in-progress attempt (if any)
  const inProgressSet = useMemo(() => {
    return sets.find((s) => s.status === "in_progress");
  }, [sets]);

  // Filtered list
  const filteredSets = useMemo(() => {
    if (selectedSubject === "SEMUA") return sets;
    return sets.filter((s) => s.subject.toUpperCase() === selectedSubject);
  }, [sets, selectedSubject]);

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
      {/* 1. Mobile-First Sticky Header */}
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
            maxWidth: "440px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {/* Brand Badge (Static / Non-touchable) */}
          <div
            className="font-mono"
            style={{
              padding: "6px 10px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              fontWeight: 800,
              fontSize: "12px",
              border: "1.5px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                backgroundColor: "var(--color-accent)",
              }}
            />
            LMS DIAGNOSTIK
          </div>

          {/* Right Controls: Theme Toggler & Avatar Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggler />

            <ProfileDropdown
              fullName={profile.fullName}
              initials={profile.initials}
              email={profile.email}
              grade={profile.grade}
            />
          </div>
        </div>
      </header>

      {/* 2. Main Scrollable Container */}
      <main
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "20px 12px 36px",
          display: "flex",
          flexDirection: "column",
          gap: "26px",
          flex: 1,
        }}
      >
        {/* Post-Completion Dismissible Alert */}
        {showAlert && (
          <div
            className="boxy-card-flat"
            style={{
              padding: "14px 16px",
              borderLeft: "4px solid var(--color-accent)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "var(--color-accent)",
                    letterSpacing: "0.04em",
                  }}
                >
                  [✓ TES SELESAI]
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.45 }}>
                Jawaban Anda telah tersimpan. Skor ujian Anda telah diperbarui secara otomatis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAlert(false)}
              className="font-mono"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                padding: "0 4px",
                lineHeight: 1,
              }}
              aria-label="Tutup pemberitahuan"
            >
              ✕
            </button>
          </div>
        )}

        {/* 3. Hero Greeting Card */}
        <div
          className="boxy-card-flat"
          style={{
            padding: "20px 18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                }}
              >
                {getTimeGreeting()}
              </span>
              <h1
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.25,
                }}
              >
                {profile.fullName}
              </h1>
            </div>

            <span
              className="font-mono"
              style={{
                fontSize: "10.5px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                padding: "4px 8px",
                backgroundColor: "var(--color-surface-dim)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              {profile.grade || "SISWA"}
            </span>
          </div>

          {/* 3-Box Score & Activity Stats Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginTop: "6px",
            }}
          >
            {/* Box 1: Selesai */}
            <div
              style={{
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface-dim)",
                padding: "12px 8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "var(--color-text)",
                }}
              >
                {String(stats.completedSets).padStart(2, "0")}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                SELESAI
              </span>
            </div>

            {/* Box 2: Rata-Rata Skor (Ferrari Red Highlight) */}
            <div
              style={{
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                boxShadow: "var(--shadow-boxy-accent)",
                padding: "12px 8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "var(--color-accent)",
                  }}
                >
                  {stats.averageScore}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--color-text-muted)",
                  }}
                >
                  /100
                </span>
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  letterSpacing: "0.02em",
                }}
              >
                RATA SKOR
              </span>
            </div>

            {/* Box 3: Belum / Pending */}
            <div
              style={{
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface-dim)",
                padding: "12px 8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "var(--color-text)",
                }}
              >
                {String(stats.pendingSets).padStart(2, "0")}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                TERSEDIA
              </span>
            </div>
          </div>
        </div>

        {/* 4. Active In-Progress Banner (If any) */}
        {inProgressSet && (
          <div
            className="boxy-card-active"
            style={{
              padding: "18px 18px",
              border: "2px solid var(--color-accent)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent)",
                    display: "inline-block",
                  }}
                />
                <span
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "var(--color-accent)",
                    letterSpacing: "0.03em",
                  }}
                >
                  SEDANG BERJALAN
                </span>
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--color-text-muted)",
                }}
              >
                {inProgressSet.progressCount || 1}/{inProgressSet.totalQuestions} SOAL
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "15.5px",
                  fontWeight: 800,
                  lineHeight: 1.35,
                }}
              >
                {inProgressSet.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "12.5px",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.45,
                }}
              >
                {inProgressSet.indicator}
              </p>
            </div>

            {/* Mini Progress track */}
            <div
              style={{
                width: "100%",
                height: "6px",
                backgroundColor: "var(--color-surface-dim)",
                border: "1px solid var(--color-border)",
                overflow: "hidden",
                margin: "2px 0",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(
                    100,
                    Math.round(((inProgressSet.progressCount || 1) / inProgressSet.totalQuestions) * 100)
                  )}%`,
                  backgroundColor: "var(--color-accent)",
                  transition: "width 0.2s ease",
                }}
              />
            </div>

            <Link
              href={inProgressSet.id.startsWith("mock-") ? "/quiz" : `/quiz/${inProgressSet.id}`}
              className="boxy-btn font-mono"
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "var(--color-accent)",
                color: "var(--color-accent-contrast)",
                border: "1.5px solid var(--color-border)",
                boxShadow: "var(--shadow-boxy)",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              LANJUTKAN PENGERJAAN ➔
            </Link>
          </div>
        )}

        {/* 5. Section Header & Filter Pills */}
        <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 2px",
            }}
          >
            <h2
              className="font-mono"
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                color: "var(--color-text)",
              }}
            >
              SET SOAL TERSEDIA
            </h2>
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--color-text-muted)",
              }}
            >
              {filteredSets.length} TERSEDIA
            </span>
          </div>

          {/* Filter Pills */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "6px",
              scrollbarWidth: "none",
            }}
          >
            {availableSubjects.map((sub) => {
              const isSelected = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`font-mono boxy-pressable-sm`}
                  style={{
                    padding: "6px 12px",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                    border: "1.5px solid var(--color-border)",
                    backgroundColor: isSelected ? "var(--color-text)" : "var(--color-surface)",
                    color: isSelected ? "var(--color-surface)" : "var(--color-text)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: isSelected ? "var(--shadow-boxy-xs)" : "none",
                  }}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {/* 6. Question Sets Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" }}>
            {filteredSets.map((item) => {
              const badge = getSubjectBadge(item.subject);
              const isCompleted = item.status === "completed";
              const isInProgress = item.status === "in_progress";
              const hasScore = isCompleted && item.score !== undefined && item.score !== null;

              return (
                <div
                  key={item.id}
                  className="boxy-card-flat"
                  style={{
                    padding: "18px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    border: "1.5px solid var(--color-border)",
                  }}
                >
                  {/* Top Meta Line: Subject Badge + Question Count */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: "1px solid var(--color-border)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            backgroundColor: badge.dot,
                            borderRadius: "50%",
                          }}
                        />
                        {item.subject.toUpperCase()}
                      </span>

                      {item.grade && (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 700,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {item.grade}
                        </span>
                      )}
                    </div>

                    <span
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {item.totalQuestions} SOAL
                    </span>
                  </div>

                  {/* Title & Indicator Snippet */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: 800,
                        lineHeight: 1.35,
                        letterSpacing: "-0.01em",
                        color: "var(--color-text)",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        lineHeight: 1.5,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {item.indicator}
                    </p>
                  </div>

                  {/* Score Feedback Pill (Only Score shown, No diagnostic classification) */}
                  {hasScore && (
                    <div
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "var(--color-surface-dim)",
                        border: "1.5px dashed var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
                        Skor Perolehan:
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          fontWeight: 900,
                          fontSize: "14px",
                          color: (item.score ?? 0) >= 70 ? "#0EA47A" : "var(--color-accent)",
                        }}
                      >
                        {item.score} / 100
                      </span>
                    </div>
                  )}

                  {/* Bottom Action Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginTop: "4px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: isCompleted
                          ? "#0EA47A"
                          : isInProgress
                          ? "var(--color-accent)"
                          : "var(--color-text-muted)",
                      }}
                    >
                      {isCompleted
                        ? "✓ SELESAI"
                        : isInProgress
                        ? "◐ SEDANG BERJALAN"
                        : "○ BELUM DIKERJAKAN"}
                    </span>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {isCompleted ? (
                        <>
                          <Link
                            href={item.id.startsWith("mock-") ? "/quiz" : (item.lastAttemptId ? `/history/${item.lastAttemptId}` : "/history")}
                            className="boxy-btn font-mono boxy-pressable-sm"
                            style={{
                              fontSize: "11px",
                              padding: "6px 12px",
                              backgroundColor: "var(--color-text)",
                              color: "var(--color-bg)",
                              border: "1.5px solid var(--color-border)",
                              textDecoration: "none",
                              fontWeight: 800,
                            }}
                          >
                            ULAS ➔
                          </Link>
                          <Link
                            href={item.id.startsWith("mock-") ? "/quiz" : `/quiz/${item.id}`}
                            className="boxy-btn font-mono boxy-pressable-sm"
                            style={{
                              fontSize: "11px",
                              padding: "6px 10px",
                              backgroundColor: "var(--color-surface-dim)",
                              color: "var(--color-text)",
                              border: "1.5px solid var(--color-border)",
                              textDecoration: "none",
                              fontWeight: 700,
                            }}
                            title="Kerjakan ulang set ini"
                          >
                            COBA LAGI ↺
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={item.id.startsWith("mock-") ? "/quiz" : `/quiz/${item.id}`}
                          className={`font-mono ${
                            isInProgress ? "boxy-btn-accent" : "boxy-btn"
                          }`}
                          style={{
                            fontSize: "11.5px",
                            padding: "6px 12px",
                            textDecoration: "none",
                            fontWeight: 800,
                          }}
                        >
                          {isInProgress ? "LANJUTKAN ➔" : "MULAI TES ➔"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredSets.length === 0 && (
              <div
                className="boxy-card-flat"
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  border: "1.5px dashed var(--color-border)",
                }}
              >
                <p className="font-mono" style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700 }}>
                  TIDAK ADA SET SOAL
                </p>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  Belum ada set soal yang tersedia untuk kategori {selectedSubject}.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
