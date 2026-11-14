"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import {
  type TeacherTestPack,
  type TeacherProfileInfo,
  type TeacherStats,
} from "@/lib/teacher-data";

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

  // Filter test packs by search query
  const filteredPacks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return testPacks;
    return testPacks.filter(
      (pack) =>
        pack.title.toLowerCase().includes(query) ||
        pack.indicator.toLowerCase().includes(query)
    );
  }, [testPacks, searchQuery]);

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

            {/* Box 2: Rata-Rata Skor Kelas (Accent Highlight) */}
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
                          className="font-mono"
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "3px 8px",
                            backgroundColor: "var(--color-surface-dim)",
                            color: "var(--color-text)",
                            border: "1px solid var(--color-border)",
                          }}
                        >
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
                            color: "#E11D48",
                            backgroundColor: "rgba(225, 29, 72, 0.10)",
                            padding: "1px 6px",
                            border: "1px solid #E11D48",
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

                    <ExportExcelButton setId={pack.id} scope="teacher" variant="secondary" label="⬇ UNDUH EXCEL (.XLSX)" />

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
