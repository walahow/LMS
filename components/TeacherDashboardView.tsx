"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import {
  type TeacherTestPack,
  type TeacherProfileInfo,
  type TeacherStats,
} from "@/lib/teacher-data";

const SUBJECT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  FISIKA: { bg: "rgba(255, 40, 0, 0.10)", text: "var(--color-accent)", dot: "#FF2800" },
  BIOLOGI: { bg: "rgba(14, 164, 122, 0.12)", text: "#0B6B50", dot: "#0EA47A" },
  KIMIA: { bg: "rgba(245, 165, 36, 0.14)", text: "#8A5200", dot: "#F5A524" },
  GEOGRAFI: { bg: "rgba(11, 127, 212, 0.12)", text: "#065A96", dot: "#0B7FD4" },
  MATEMATIKA: { bg: "rgba(139, 92, 246, 0.12)", text: "#6D28D9", dot: "#8B5CF6" },
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

export function TeacherDashboardView({
  profile,
  stats,
  testPacks,
}: {
  profile: TeacherProfileInfo;
  stats: TeacherStats;
  testPacks: TeacherTestPack[];
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("SEMUA");

  // Derive distinct subjects from test packs
  const availableSubjects = useMemo(() => {
    const list = Array.from(new Set(testPacks.map((p) => p.subject.toUpperCase()))).filter(Boolean);
    return ["SEMUA", ...list];
  }, [testPacks]);

  // Filter test packs
  const filteredPacks = useMemo(() => {
    return testPacks.filter((pack) => {
      const matchSubject = selectedSubject === "SEMUA" || pack.subject.toUpperCase() === selectedSubject;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        pack.title.toLowerCase().includes(query) ||
        pack.indicator.toLowerCase().includes(query) ||
        pack.subject.toLowerCase().includes(query);
      return matchSubject && matchQuery;
    });
  }, [testPacks, selectedSubject, searchQuery]);

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
      {/* 1. Mobile-First Sticky Header (matching Student Dashboard) */}
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
          {/* Brand Badge */}
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
            <span
              style={{
                fontSize: "10px",
                fontWeight: 900,
                color: "var(--color-accent)",
                marginLeft: "2px",
              }}
            >
              [GURU]
            </span>
          </div>

          {/* Right Controls: Theme Toggler & Avatar Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggler />

            <ProfileDropdown
              fullName={profile.fullName}
              initials={profile.initials}
              email={profile.email}
              grade="GURU PENGAMPU"
              profileHref="/teacher/profile"
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
          gap: "24px",
          flex: 1,
        }}
      >
        {/* 3. Hero Greeting & Stats Card (Inspired by Student Dashboard) */}
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
                  fontSize: "20px",
                  fontWeight: 900,
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
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                padding: "3px 7px",
                backgroundColor: "var(--color-accent-dim)",
                border: "1px solid var(--color-accent)",
                color: "var(--color-accent)",
                flexShrink: 0,
              }}
            >
              GURU PENGAMPU
            </span>
          </div>

          {/* 3-Box Diagnostic Stats Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {/* Box 1: Total Paket Tes */}
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
                {String(stats.totalPacks).padStart(2, "0")}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                PAKET SOAL
              </span>
            </div>

            {/* Box 2: Rata-Rata Skor Kelas (Ferrari Red Highlight) */}
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
                    fontWeight: 800,
                    color: "var(--color-text-muted)",
                  }}
                >
                  /100
                </span>
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  letterSpacing: "0.02em",
                }}
              >
                RATA SKOR
              </span>
            </div>

            {/* Box 3: Tingkat Partisipasi Siswa */}
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
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "var(--color-text)",
                  }}
                >
                  {stats.participationRate}%
                </span>
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                PARTISIPASI
              </span>
            </div>
          </div>
        </div>

        {/* 4. Section Header, Search Bar & Category Filter Pills */}
        <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                textTransform: "uppercase",
              }}
            >
              PAKET TES DIAGNOSTIK
            </h2>
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--color-text-muted)",
              }}
            >
              {filteredPacks.length} PAKET
            </span>
          </div>

          {/* Search Input for Test Packs */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul paket tes atau indikator..."
              className="boxy-input font-mono"
              style={{ fontSize: "12.5px", paddingLeft: "34px" }}
            />
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {availableSubjects.map((sub) => {
              const isSelected = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className="font-mono boxy-pressable-sm"
                  style={{
                    padding: "5px 12px",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    backgroundColor: isSelected ? "var(--color-accent)" : "var(--color-surface)",
                    color: isSelected ? "var(--color-accent-contrast)" : "var(--color-text)",
                    border: isSelected ? "1.5px solid var(--color-border)" : "1.5px solid var(--color-border)",
                    boxShadow: isSelected ? "var(--shadow-boxy-xs)" : "none",
                  }}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {/* 5. Test Pack Cards List (Inspired by Student Dashboard Cards) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredPacks.length === 0 ? (
              <div
                className="boxy-card-flat"
                style={{
                  padding: "28px 16px",
                  textAlign: "center",
                  border: "1.5px dashed var(--color-border)",
                  backgroundColor: "var(--color-surface-dim)",
                }}
              >
                <p className="font-mono" style={{ margin: 0, fontSize: "12.5px", color: "var(--color-text-muted)" }}>
                  Tidak ada paket tes yang cocok dengan pencarian Anda.
                </p>
              </div>
            ) : (
              filteredPacks.map((pack) => {
                const badge = getSubjectBadge(pack.subject);
                const studentsWithMisconception = pack.students.filter(
                  (s) => s.diagnosticsCount.miskonsepsi > 0
                ).length;

                return (
                  <div
                    key={pack.id}
                    className="boxy-card-flat"
                    style={{
                      padding: "18px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      backgroundColor: "var(--color-surface)",
                      border: "1.5px solid var(--color-border)",
                      transition: "transform 0.1s ease, box-shadow 0.1s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div className="dither-fade-right" aria-hidden="true" />
                    {/* Top Row: Subject Badge + Total Questions */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          className="badge-mono"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: "1px solid var(--color-border)",
                            fontSize: "10px",
                            padding: "2px 7px",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: badge.dot,
                              display: "inline-block",
                            }}
                          />
                          {pack.subject.toUpperCase()}
                        </span>
                        <span className="font-mono" style={{ fontSize: "10.5px", color: "var(--color-text-muted)" }}>
                          {pack.grade || "Kelas 10"}
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
                        {pack.questionCount} SOAL
                      </span>
                    </div>

                    {/* Middle: Title & Learning Indicator */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "15.5px",
                          fontWeight: 800,
                          lineHeight: 1.35,
                          color: "var(--color-text)",
                        }}
                      >
                        {pack.title}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12.5px",
                          color: "var(--color-text-muted)",
                          lineHeight: 1.45,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {pack.indicator}
                      </p>
                    </div>

                    {/* Meta Bar: Student participation & Misconception count */}
                    <div
                      style={{
                        padding: "8px 10px",
                        backgroundColor: "var(--color-surface-dim)",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text)" }}>
                        <strong>{pack.studentAttemptCount}</strong> / {pack.totalStudents} Mengerjakan
                      </span>

                      {studentsWithMisconception > 0 ? (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 800,
                            color: "var(--color-accent)",
                            backgroundColor: "var(--color-accent-dim)",
                            padding: "1px 6px",
                            border: "1px solid var(--color-accent)",
                          }}
                        >
                          ⚠ {studentsWithMisconception} Miskonsepsi
                        </span>
                      ) : (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 700,
                            color: "#0B6B50",
                          }}
                        >
                          ✓ 0 Miskonsepsi
                        </span>
                      )}
                    </div>

                    {/* Bottom CTA Button: Navigates to Test Pack Detail */}
                    <Link
                      href={`/teacher/sets/${pack.id}`}
                      className="boxy-btn font-mono boxy-pressable-sm"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text)",
                        border: "1.5px solid var(--color-border)",
                        boxShadow: "var(--shadow-boxy-xs)",
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
                      <span>LIHAT HASIL & SISWA</span>
                      <span>➔</span>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
