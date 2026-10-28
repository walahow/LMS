"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { type Diagnosis } from "@/lib/diagnose";
import {
  type TeacherTestPack,
  type TeacherProfileInfo,
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

const DIAGNOSIS_THEME: Record<
  Diagnosis,
  { label: string; short: string; bg: string; text: string; border: string; dot: string }
> = {
  paham: {
    label: "Paham Konsep",
    short: "PAHAM",
    bg: "rgba(14, 164, 122, 0.12)",
    text: "#0B6B50",
    border: "#0EA47A",
    dot: "#0EA47A",
  },
  miskonsepsi: {
    label: "Miskonsepsi",
    short: "MISK",
    bg: "rgba(255, 40, 0, 0.12)",
    text: "var(--color-accent)",
    border: "var(--color-accent)",
    dot: "#FF2800",
  },
  lucky_guess: {
    label: "Lucky Guess",
    short: "TEBAK",
    bg: "rgba(245, 165, 36, 0.15)",
    text: "#8A5200",
    border: "#F5A524",
    dot: "#F5A524",
  },
  tidak_paham: {
    label: "Tidak Paham Konsep",
    short: "TIDAK",
    bg: "rgba(113, 113, 122, 0.12)",
    text: "var(--color-text-muted)",
    border: "var(--color-text-muted)",
    dot: "#71717A",
  },
};

export function TeacherPackDetailView({
  pack,
  profile,
}: {
  pack: TeacherTestPack;
  profile: TeacherProfileInfo;
}) {
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [studentFilter, setStudentFilter] = useState<"SEMUA" | Diagnosis>("SEMUA");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const badge = getSubjectBadge(pack.subject);

  // Filter students under active test pack
  const filteredStudents = useMemo(() => {
    return pack.students.filter((student) => {
      const query = studentSearch.toLowerCase().trim();
      const matchQuery =
        !query ||
        student.fullName.toLowerCase().includes(query) ||
        student.grade.toLowerCase().includes(query);

      let matchFilter = true;
      if (studentFilter === "miskonsepsi") {
        matchFilter = student.diagnosticsCount.miskonsepsi > 0;
      } else if (studentFilter === "paham") {
        matchFilter = student.diagnosticsCount.paham > student.diagnosticsCount.miskonsepsi;
      } else if (studentFilter === "tidak_paham") {
        matchFilter = student.diagnosticsCount.tidak_paham > 0;
      } else if (studentFilter === "lucky_guess") {
        matchFilter = student.diagnosticsCount.lucky_guess > 0;
      }

      return matchQuery && matchFilter;
    });
  }, [pack, studentSearch, studentFilter]);

  // Toggle student expansion
  const toggleStudent = (studentId: string) => {
    setExpandedStudentId((curr) => (curr === studentId ? null : studentId));
  };

  // Pack total responses count
  const packTotalResponses = useMemo(() => {
    const { paham, miskonsepsi, lucky_guess, tidak_paham } = pack.diagnosticsCount;
    return paham + miskonsepsi + lucky_guess + tidak_paham;
  }, [pack]);

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
            maxWidth: "460px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {/* Back Button to Dashboard */}
          <Link
            href="/teacher/dashboard"
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
            <span>❮</span>
            <span>BERANDA GURU</span>
          </Link>

          {/* Subject Badge */}
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
          maxWidth: "460px",
          padding: "20px 12px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          flex: 1,
        }}
      >
        {/* 3. Test Pack Hero Overview Card */}
        <div
          className="boxy-card-flat"
          style={{
            padding: "18px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            borderLeft: "4px solid var(--color-accent)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="dither-fade-right" aria-hidden="true" />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                {pack.grade || "Kelas 10"} · {pack.questionCount} Soal · {pack.studentAttemptCount} Mengerjakan
              </span>
            </div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 900,
                color: "var(--color-text)",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {pack.title}
            </h1>
          </div>

          {/* Indicator Box */}
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "var(--color-surface-dim)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: "3px",
            }}
          >
            <span
              className="font-mono"
              style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-text-muted)", letterSpacing: "0.04em" }}
            >
              INDIKATOR PEMBELAJARAN:
            </span>
            <p style={{ fontSize: "12.5px", color: "var(--color-text)", margin: 0, lineHeight: 1.45 }}>
              {pack.indicator}
            </p>
          </div>

          {/* Aggregate Diagnostic Proportion Bar */}
          {packTotalResponses > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "11px",
                }}
              >
                <span className="font-mono" style={{ fontWeight: 800, color: "var(--color-text)" }}>
                  DISTRIBUSI KELAS ({packTotalResponses} Respons)
                </span>
                <span className="font-mono" style={{ color: "var(--color-text-muted)" }}>
                  {pack.studentAttemptCount} / {pack.totalStudents} Siswa
                </span>
              </div>

              {/* Multi-segment Bar */}
              <div
                style={{
                  display: "flex",
                  height: "12px",
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: "var(--color-surface-dim)",
                  overflow: "hidden",
                }}
              >
                {pack.diagnosticsCount.paham > 0 && (
                  <div
                    title={`Paham: ${pack.diagnosticsCount.paham}`}
                    style={{
                      width: `${(pack.diagnosticsCount.paham / packTotalResponses) * 100}%`,
                      backgroundColor: DIAGNOSIS_THEME.paham.border,
                    }}
                  />
                )}
                {pack.diagnosticsCount.miskonsepsi > 0 && (
                  <div
                    title={`Miskonsepsi: ${pack.diagnosticsCount.miskonsepsi}`}
                    style={{
                      width: `${(pack.diagnosticsCount.miskonsepsi / packTotalResponses) * 100}%`,
                      backgroundColor: "var(--color-accent)",
                    }}
                  />
                )}
                {pack.diagnosticsCount.lucky_guess > 0 && (
                  <div
                    title={`Lucky Guess: ${pack.diagnosticsCount.lucky_guess}`}
                    style={{
                      width: `${(pack.diagnosticsCount.lucky_guess / packTotalResponses) * 100}%`,
                      backgroundColor: DIAGNOSIS_THEME.lucky_guess.border,
                    }}
                  />
                )}
                {pack.diagnosticsCount.tidak_paham > 0 && (
                  <div
                    title={`Tidak Paham: ${pack.diagnosticsCount.tidak_paham}`}
                    style={{
                      width: `${(pack.diagnosticsCount.tidak_paham / packTotalResponses) * 100}%`,
                      backgroundColor: DIAGNOSIS_THEME.tidak_paham.border,
                    }}
                  />
                )}
              </div>

              {/* Legend Badges */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  fontSize: "10.5px",
                  marginTop: "2px",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: DIAGNOSIS_THEME.paham.text }}>
                  <span style={{ width: "7px", height: "7px", backgroundColor: DIAGNOSIS_THEME.paham.border }} />
                  Paham: <strong>{pack.diagnosticsCount.paham}</strong>
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--color-accent)",
                    fontWeight: 800,
                  }}
                >
                  <span style={{ width: "7px", height: "7px", backgroundColor: "var(--color-accent)" }} />
                  Miskonsepsi: <strong>{pack.diagnosticsCount.miskonsepsi}</strong>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: DIAGNOSIS_THEME.lucky_guess.text }}>
                  <span style={{ width: "7px", height: "7px", backgroundColor: DIAGNOSIS_THEME.lucky_guess.border }} />
                  Lucky: <strong>{pack.diagnosticsCount.lucky_guess}</strong>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: DIAGNOSIS_THEME.tidak_paham.text }}>
                  <span style={{ width: "7px", height: "7px", backgroundColor: DIAGNOSIS_THEME.tidak_paham.border }} />
                  Tidak: <strong>{pack.diagnosticsCount.tidak_paham}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Student Search & Quick Filter Controls */}
        <section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2
              className="font-mono"
              style={{
                fontSize: "12.5px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                margin: 0,
                color: "var(--color-text)",
              }}
            >
              RESPONS & DIAGNOSIS SISWA
            </h2>
            <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
              {filteredStudents.length} / {pack.students.length} SISWA
            </span>
          </div>

          {/* Search Input for Students */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Cari siswa berdasarkan nama atau kelas..."
              className="boxy-input font-mono"
              style={{ fontSize: "12px", paddingLeft: "34px" }}
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
            {studentSearch && (
              <button
                type="button"
                onClick={() => setStudentSearch("")}
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

          {/* Quick Filter Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => setStudentFilter("SEMUA")}
              className="font-mono boxy-pressable-sm"
              style={{
                padding: "4px 9px",
                fontSize: "10.5px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                backgroundColor: studentFilter === "SEMUA" ? "var(--color-text)" : "var(--color-surface)",
                color: studentFilter === "SEMUA" ? "var(--color-surface)" : "var(--color-text)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              SEMUA ({pack.students.length})
            </button>

            <button
              type="button"
              onClick={() => setStudentFilter("miskonsepsi")}
              className="font-mono boxy-pressable-sm"
              style={{
                padding: "4px 9px",
                fontSize: "10.5px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                backgroundColor:
                  studentFilter === "miskonsepsi" ? "var(--color-accent)" : "var(--color-accent-dim)",
                color: studentFilter === "miskonsepsi" ? "var(--color-accent-contrast)" : "var(--color-accent)",
                border: "1.5px solid var(--color-accent)",
              }}
            >
              ⚠ MISKONSEPSI ({pack.students.filter((s) => s.diagnosticsCount.miskonsepsi > 0).length})
            </button>

            <button
              type="button"
              onClick={() => setStudentFilter("paham")}
              className="font-mono boxy-pressable-sm"
              style={{
                padding: "4px 9px",
                fontSize: "10.5px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                backgroundColor:
                  studentFilter === "paham" ? DIAGNOSIS_THEME.paham.border : DIAGNOSIS_THEME.paham.bg,
                color: studentFilter === "paham" ? "#FFFFFF" : DIAGNOSIS_THEME.paham.text,
                border: "1.5px solid var(--color-border)",
              }}
            >
              ✓ PAHAM (
              {
                pack.students.filter(
                  (s) => s.diagnosticsCount.paham > s.diagnosticsCount.miskonsepsi
                ).length
              }
              )
            </button>

            <button
              type="button"
              onClick={() => setStudentFilter("tidak_paham")}
              className="font-mono boxy-pressable-sm"
              style={{
                padding: "4px 9px",
                fontSize: "10.5px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                backgroundColor:
                  studentFilter === "tidak_paham"
                    ? DIAGNOSIS_THEME.tidak_paham.border
                    : DIAGNOSIS_THEME.tidak_paham.bg,
                color: studentFilter === "tidak_paham" ? "#FFFFFF" : DIAGNOSIS_THEME.tidak_paham.text,
                border: "1.5px solid var(--color-border)",
              }}
            >
              ✗ TIDAK PAHAM ({pack.students.filter((s) => s.diagnosticsCount.tidak_paham > 0).length})
            </button>

            <button
              type="button"
              onClick={() => setStudentFilter("lucky_guess")}
              className="font-mono boxy-pressable-sm"
              style={{
                padding: "4px 9px",
                fontSize: "10.5px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                backgroundColor:
                  studentFilter === "lucky_guess"
                    ? DIAGNOSIS_THEME.lucky_guess.border
                    : DIAGNOSIS_THEME.lucky_guess.bg,
                color: studentFilter === "lucky_guess" ? "#FFFFFF" : DIAGNOSIS_THEME.lucky_guess.text,
                border: "1.5px solid var(--color-border)",
              }}
            >
              ✦ LUCKY ({pack.students.filter((s) => s.diagnosticsCount.lucky_guess > 0).length})
            </button>
          </div>
        </section>

        {/* 5. Student List with Score & 3-Tier Drill-Down */}
        <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredStudents.length === 0 ? (
            <div
              className="boxy-card-flat"
              style={{
                padding: "24px 16px",
                textAlign: "center",
                border: "1.5px dashed var(--color-border)",
              }}
            >
              <p className="font-mono" style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                Tidak ada siswa yang sesuai dengan filter pencarian.
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isExpanded = expandedStudentId === student.studentId;
              const hasMisconception = student.diagnosticsCount.miskonsepsi > 0;

              return (
                <div
                  key={student.studentId}
                  className="boxy-card-flat"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    border: isExpanded
                      ? "2px solid var(--color-accent)"
                      : "1.5px solid var(--color-border)",
                    boxShadow: isExpanded ? "var(--shadow-boxy-accent)" : "none",
                    transition: "border-color 0.12s ease, box-shadow 0.12s ease",
                  }}
                >
                  {/* Student Card Summary Header */}
                  <div
                    style={{
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      backgroundColor: "var(--color-surface)",
                    }}
                  >
                    {/* Top Row: Avatar, Name, Grade, Score */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {/* Avatar */}
                        <div
                          className="font-mono"
                          style={{
                            width: "38px",
                            height: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: hasMisconception ? "var(--color-accent-dim)" : "var(--color-surface-dim)",
                            border: hasMisconception ? "1.5px solid var(--color-accent)" : "1.5px solid var(--color-border)",
                            color: hasMisconception ? "var(--color-accent)" : "var(--color-text)",
                            fontWeight: 900,
                            fontSize: "13px",
                            flexShrink: 0,
                          }}
                        >
                          {student.initials}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: 800,
                                color: "var(--color-text)",
                                lineHeight: 1.2,
                              }}
                            >
                              {student.fullName}
                            </span>
                            <span
                              className="font-mono"
                              style={{
                                fontSize: "10px",
                                padding: "1px 5px",
                                backgroundColor: "var(--color-surface-dim)",
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {student.grade}
                            </span>
                          </div>
                          <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                            Diselesaikan: {student.submittedAt}
                          </span>
                        </div>
                      </div>

                      {/* Score & Misconception Alert */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          className="font-mono"
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "var(--color-surface-dim)",
                            border: "1.5px solid var(--color-border)",
                            fontSize: "12px",
                            fontWeight: 800,
                            color: "var(--color-text)",
                          }}
                        >
                          SKOR: <strong>{student.score}</strong> / 100
                        </div>

                        {hasMisconception && (
                          <div
                            className="font-mono"
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "var(--color-accent-dim)",
                              border: "1.5px solid var(--color-accent)",
                              fontSize: "11px",
                              fontWeight: 800,
                              color: "var(--color-accent)",
                            }}
                          >
                            ⚠ {student.diagnosticsCount.miskonsepsi} MISK
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Numbered Matrix Chips + Accordion Button */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                        paddingTop: "6px",
                        borderTop: "1px solid var(--color-border)",
                      }}
                    >
                      {/* Numbered Matrix Chips */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                        <span className="font-mono" style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--color-text-muted)", marginRight: "4px" }}>
                          MATRIX:
                        </span>
                        {student.questions.map((q) => {
                          const theme = DIAGNOSIS_THEME[q.diagnosis];
                          return (
                            <div
                              key={q.questionId}
                              title={`Soal ${q.position}: ${theme.label}`}
                              className="font-mono"
                              style={{
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                fontWeight: 900,
                                backgroundColor: theme.bg,
                                border: `1.5px solid ${theme.border}`,
                                color: theme.text,
                              }}
                            >
                              {String(q.position).padStart(2, "0")}
                            </div>
                          );
                        })}
                      </div>

                      {/* Accordion Expand/Collapse Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleStudent(student.studentId)}
                        className="font-mono boxy-pressable-sm"
                        style={{
                          padding: "5px 10px",
                          fontSize: "11px",
                          fontWeight: 800,
                          cursor: "pointer",
                          backgroundColor: isExpanded ? "var(--color-accent)" : "var(--color-surface)",
                          color: isExpanded ? "var(--color-accent-contrast)" : "var(--color-text)",
                          border: "1.5px solid var(--color-border)",
                          boxShadow: isExpanded ? "none" : "var(--shadow-boxy-xs)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {isExpanded ? "TUTUP DETAIL ▴" : "LIHAT JAWABAN 3-TIER ▾"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded 3-Tier Drill-Down */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "var(--color-surface-dim)",
                        borderTop: "1.5px solid var(--color-border)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 800,
                            color: "var(--color-text)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          DETAIL JAWABAN & DIAGNOSIS — {student.fullName.toUpperCase()}
                        </span>
                        <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                          {student.questions.length} SOAL
                        </span>
                      </div>

                      {/* Question by question inspection */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {student.questions.map((q) => {
                          const theme = DIAGNOSIS_THEME[q.diagnosis];
                          const isAnswerCorrect = q.studentAnswer === q.correctOption;
                          const isReasonCorrect = q.studentReason === q.correctReason;
                          const isMisconception = q.diagnosis === "miskonsepsi";

                          return (
                            <div
                              key={q.questionId}
                              className="boxy-card-flat"
                              style={{
                                padding: "12px 14px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                border: isMisconception
                                  ? "2px solid var(--color-accent)"
                                  : "1.5px solid var(--color-border)",
                                backgroundColor: "var(--color-surface)",
                              }}
                            >
                              {/* Header: Position & Diagnosis */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  gap: "8px",
                                }}
                              >
                                <span
                                  className="font-mono"
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 900,
                                    padding: "2px 6px",
                                    backgroundColor: "var(--color-surface-dim)",
                                    border: "1px solid var(--color-border)",
                                  }}
                                >
                                  SOAL {String(q.position).padStart(2, "0")}
                                </span>

                                <span
                                  className="font-mono"
                                  style={{
                                    fontSize: "10.5px",
                                    fontWeight: 800,
                                    padding: "3px 8px",
                                    backgroundColor: theme.bg,
                                    border: `1.5px solid ${theme.border}`,
                                    color: theme.text,
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  {isMisconception && "⚠ "}
                                  {theme.label.toUpperCase()}
                                </span>
                              </div>

                              {/* Question Stem */}
                              <p
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "var(--color-text)",
                                  margin: 0,
                                  lineHeight: 1.4,
                                }}
                              >
                                {q.stem}
                              </p>

                              {/* 3-Tier Grid Breakdown */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr",
                                  gap: "8px",
                                  paddingTop: "6px",
                                  borderTop: "1px solid var(--color-border)",
                                }}
                              >
                                {/* Tier 1: Answer */}
                                <div
                                  style={{
                                    padding: "8px 10px",
                                    backgroundColor: "var(--color-surface-dim)",
                                    border: "1px solid var(--color-border)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "3px",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span
                                      className="font-mono"
                                      style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-text-muted)" }}
                                    >
                                      TIER 1: PILIHAN JAWABAN
                                    </span>
                                    <span
                                      className="font-mono"
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 800,
                                        color: isAnswerCorrect ? "#0B6B50" : "var(--color-accent)",
                                      }}
                                    >
                                      {isAnswerCorrect ? "✓ BENAR" : "✗ SALAH"}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: "12px", color: "var(--color-text)", margin: 0, lineHeight: 1.35 }}>
                                    {q.options[q.studentAnswer] ?? "Pilihan tidak ada"}
                                  </p>
                                  {!isAnswerCorrect && (
                                    <span
                                      className="font-mono"
                                      style={{ fontSize: "10px", color: "var(--color-text-muted)", marginTop: "2px" }}
                                    >
                                      Kunci: {q.options[q.correctOption]}
                                    </span>
                                  )}
                                </div>

                                {/* Tier 2: Reason */}
                                <div
                                  style={{
                                    padding: "8px 10px",
                                    backgroundColor: "var(--color-surface-dim)",
                                    border: "1px solid var(--color-border)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "3px",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span
                                      className="font-mono"
                                      style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-text-muted)" }}
                                    >
                                      TIER 2: PILIHAN ALASAN
                                    </span>
                                    <span
                                      className="font-mono"
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 800,
                                        color: isReasonCorrect ? "#0B6B50" : "var(--color-accent)",
                                      }}
                                    >
                                      {isReasonCorrect ? "✓ BENAR" : "✗ SALAH"}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: "12px", color: "var(--color-text)", margin: 0, lineHeight: 1.35 }}>
                                    {q.reasons[q.studentReason] ?? "Alasan tidak ada"}
                                  </p>
                                  {!isReasonCorrect && (
                                    <span
                                      className="font-mono"
                                      style={{ fontSize: "10px", color: "var(--color-text-muted)", marginTop: "2px" }}
                                    >
                                      Kunci: {q.reasons[q.correctReason]}
                                    </span>
                                  )}
                                </div>

                                {/* Tier 3: Confidence */}
                                <div
                                  style={{
                                    padding: "8px 10px",
                                    backgroundColor: "var(--color-surface-dim)",
                                    border: "1px solid var(--color-border)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "3px",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span
                                      className="font-mono"
                                      style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-text-muted)" }}
                                    >
                                      TIER 3: KEYAKINAN
                                    </span>
                                    <span
                                      className="font-mono"
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 900,
                                        color: q.confident ? "var(--color-accent)" : "var(--color-text-muted)",
                                      }}
                                    >
                                      {q.confident ? "YAKIN" : "TIDAK YAKIN"}
                                    </span>
                                  </div>
                                  <span
                                    className="font-mono"
                                    style={{ fontSize: "10.5px", color: "var(--color-text-muted)" }}
                                  >
                                    {q.confident
                                      ? "Siswa merasa yakin dengan kombinasi jawaban & alasannya"
                                      : "Siswa ragu-ragu atau menebak"}
                                  </span>
                                </div>
                              </div>

                              {/* Misconception Alert Callout */}
                              {isMisconception && (
                                <div
                                  style={{
                                    padding: "8px 10px",
                                    backgroundColor: "var(--color-accent-dim)",
                                    border: "1px dashed var(--color-accent)",
                                    fontSize: "11px",
                                    color: "var(--color-text)",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  <strong style={{ color: "var(--color-accent)" }}>Peringatan Miskonsepsi: </strong>
                                  Siswa menjawab yakin meskipun jawaban atau alasannya salah. Hal ini menunjukkan miskonsepsi nyata yang perlu dibahas di kelas.
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
