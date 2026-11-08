"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import type { Diagnosis } from "@/lib/diagnose";
import type { StudentQuestionDetail, DiagnosticCount } from "@/lib/teacher-data";

export type TeacherStudentDetailProps = {
  packId: string;
  packTitle: string;
  subject?: string;
  grade?: string;
  indicator?: string;
  backHref?: string;
  student: {
    studentId: string;
    fullName: string;
    initials: string;
    grade: string;
    submittedAt: string;
    score: number;
    diagnosticsCount: DiagnosticCount;
    dominantDiagnosis: Diagnosis;
  };
  questions: StudentQuestionDetail[];
};

const DIAGNOSIS_STYLE: Record<
  Diagnosis,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  paham: {
    label: "PAHAM KONSEP",
    bg: "rgba(14, 164, 122, 0.12)",
    text: "#0B6B50",
    border: "#0EA47A",
    desc: "Siswa memahami konsep dengan benar dan memiliki keyakinan penuh terhadap jawabannya.",
  },
  miskonsepsi: {
    label: "MISKONSEPSI",
    bg: "rgba(225, 29, 72, 0.10)",
    text: "#E11D48",
    border: "#E11D48",
    desc: "Siswa memilih jawaban atau alasan yang keliru namun merasa sangat yakin. Perlu remediasi konsep secara terarah.",
  },
  lucky_guess: {
    label: "LUCKY GUESS",
    bg: "var(--color-accent-dim)",
    text: "var(--color-accent)",
    border: "var(--color-accent)",
    desc: "Siswa memilih jawaban dan alasan benar secara kebetulan tanpa keyakinan konsep.",
  },
  tidak_paham: {
    label: "TIDAK PAHAM",
    bg: "rgba(113, 113, 122, 0.12)",
    text: "var(--color-text-muted)",
    border: "var(--color-border)",
    desc: "Siswa belum memahami materi dan tidak yakin saat memilih opsi jawaban/alasan.",
  },
};

const IDX_TO_LETTER = ["A", "B", "C", "D"];

export function TeacherStudentDetailView({
  packId,
  packTitle,
  subject = "FISIKA",
  grade = "KELAS X",
  indicator,
  backHref,
  student,
  questions,
}: TeacherStudentDetailProps) {
  const returnUrl = backHref || `/teacher/sets/${packId}`;
  const total = questions.length;
  const counts = student.diagnosticsCount;

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
          {/* Back Button */}
          <Link
            href={returnUrl}
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

          {/* Title Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              className="badge-mono font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 900,
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              DETAIL HASIL SISWA
            </span>
          </div>

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
          gap: "20px",
        }}
      >
        {/* Student Profile & Test Summary Card */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="dither-fade-right" aria-hidden="true" />

          {/* Student Identity Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Boxy Avatar */}
            <div
              className="font-mono"
              style={{
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  counts.miskonsepsi > 0 ? "rgba(225, 29, 72, 0.12)" : "var(--color-surface-dim)",
                border:
                  counts.miskonsepsi > 0 ? "1.5px solid #E11D48" : "1.5px solid var(--color-border)",
                color: counts.miskonsepsi > 0 ? "#E11D48" : "var(--color-text)",
                fontWeight: 900,
                fontSize: "15px",
                flexShrink: 0,
              }}
            >
              {student.initials}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "var(--color-text)",
                    lineHeight: 1.25,
                  }}
                >
                  {student.fullName}
                </span>
                <span
                  className="badge-mono font-mono"
                  style={{
                    fontSize: "10px",
                    backgroundColor: "var(--color-surface-dim)",
                    borderColor: "var(--color-border)",
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

          {/* Test Pack Meta */}
          <div
            style={{
              paddingTop: "12px",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="badge-mono font-mono" style={{ fontSize: "10px" }}>
                {grade}
              </span>
            </div>
            <h1
              style={{
                fontSize: "17px",
                fontWeight: 900,
                color: "var(--color-text)",
                margin: "4px 0 0",
                lineHeight: 1.3,
              }}
            >
              {packTitle}
            </h1>
            {indicator && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  margin: "4px 0 0",
                  lineHeight: 1.45,
                }}
              >
                Indikator: {indicator}
              </p>
            )}
          </div>

          {/* Score Badge */}
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "var(--color-surface-dim)",
              border: "1.5px solid var(--color-border)",
              boxShadow: "var(--shadow-boxy-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.04em",
                }}
              >
                SKOR PEMAHAMAN
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "var(--color-accent)",
                  lineHeight: 1,
                }}
              >
                {student.score} <span style={{ fontSize: "16px", color: "var(--color-text)" }}>/ 100</span>
              </span>
            </div>

            <span
              className="badge-mono font-mono"
              style={{
                fontSize: "11px",
                backgroundColor: student.score >= 70 ? "rgba(14, 164, 122, 0.12)" : "rgba(225, 29, 72, 0.10)",
                borderColor: student.score >= 70 ? "#0EA47A" : "#E11D48",
                color: student.score >= 70 ? "#0B6B50" : "#E11D48",
                fontWeight: 900,
              }}
            >
              {counts.paham} / {total} SOAL PAHAM
            </span>
          </div>

          {/* 4-Box Diagnostic Summary Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Paham */}
            <div
              style={{
                padding: "10px",
                backgroundColor: DIAGNOSIS_STYLE.paham.bg,
                border: `1.5px solid ${DIAGNOSIS_STYLE.paham.border}`,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span className="font-mono" style={{ fontSize: "10px", fontWeight: 800, color: DIAGNOSIS_STYLE.paham.text }}>
                PAHAM KONSEP
              </span>
              <span className="font-mono" style={{ fontSize: "16px", fontWeight: 900, color: DIAGNOSIS_STYLE.paham.text }}>
                {counts.paham} / {total}
              </span>
            </div>

            {/* Miskonsepsi */}
            <div
              style={{
                padding: "10px",
                backgroundColor: DIAGNOSIS_STYLE.miskonsepsi.bg,
                border: `1.5px solid ${DIAGNOSIS_STYLE.miskonsepsi.border}`,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span className="font-mono" style={{ fontSize: "10px", fontWeight: 800, color: DIAGNOSIS_STYLE.miskonsepsi.text }}>
                MISKONSEPSI {counts.miskonsepsi > 0 && "⚠"}
              </span>
              <span className="font-mono" style={{ fontSize: "16px", fontWeight: 900, color: DIAGNOSIS_STYLE.miskonsepsi.text }}>
                {counts.miskonsepsi} / {total}
              </span>
            </div>

            {/* Lucky Guess */}
            <div
              style={{
                padding: "10px",
                backgroundColor: DIAGNOSIS_STYLE.lucky_guess.bg,
                border: `1.5px solid ${DIAGNOSIS_STYLE.lucky_guess.border}`,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span className="font-mono" style={{ fontSize: "10px", fontWeight: 800, color: DIAGNOSIS_STYLE.lucky_guess.text }}>
                LUCKY GUESS
              </span>
              <span className="font-mono" style={{ fontSize: "16px", fontWeight: 900, color: DIAGNOSIS_STYLE.lucky_guess.text }}>
                {counts.lucky_guess} / {total}
              </span>
            </div>

            {/* Tidak Paham */}
            <div
              style={{
                padding: "10px",
                backgroundColor: DIAGNOSIS_STYLE.tidak_paham.bg,
                border: `1.5px solid ${DIAGNOSIS_STYLE.tidak_paham.border}`,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span className="font-mono" style={{ fontSize: "10px", fontWeight: 800, color: DIAGNOSIS_STYLE.tidak_paham.text }}>
                TIDAK PAHAM
              </span>
              <span className="font-mono" style={{ fontSize: "16px", fontWeight: 900, color: "var(--color-text)" }}>
                {counts.tidak_paham} / {total}
              </span>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="badge-mono font-mono" style={{ fontSize: "10px", backgroundColor: "var(--color-text)", color: "var(--color-bg)" }}>
              RINCIAN SOAL
            </span>
            <span className="font-mono" style={{ fontSize: "12px", fontWeight: 800, color: "var(--color-text)" }}>
              EVALUASI 3-TIER SISWA
            </span>
          </div>
          <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            {questions.length} SOAL
          </span>
        </div>

        {/* Question Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {questions.map((q) => {
            const diag = DIAGNOSIS_STYLE[q.diagnosis] || DIAGNOSIS_STYLE.tidak_paham;
            const isAnswerOk = q.studentAnswer === q.correctOption;
            const isReasonOk = q.studentReason === q.correctReason;
            const isMisconception = q.diagnosis === "miskonsepsi";

            return (
              <article
                key={q.questionId}
                className="boxy-card-flat"
                style={{
                  padding: "18px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  border: isMisconception ? "2px solid #E11D48" : "1.5px solid var(--color-border)",
                  boxShadow: isMisconception ? "0 2px 8px rgba(225, 29, 72, 0.15)" : undefined,
                }}
              >
                {/* Question Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1.5px dashed var(--color-border)",
                    paddingBottom: "10px",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "12px",
                      fontWeight: 900,
                      padding: "2px 8px",
                      backgroundColor: "var(--color-surface-dim)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  >
                    SOAL {String(q.position).padStart(2, "0")}
                  </span>

                  <span
                    className="badge-mono font-mono"
                    style={{
                      fontSize: "10px",
                      fontWeight: 900,
                      backgroundColor: diag.bg,
                      color: diag.text,
                      borderColor: diag.border,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {diag.label}
                  </span>
                </div>

                {/* Question Stem */}
                <p
                  style={{
                    fontSize: "14.5px",
                    lineHeight: 1.5,
                    fontWeight: 700,
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {q.stem}
                </p>

                {/* Tier 1: Pilihan Jawaban */}
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "var(--color-surface-dim)",
                    border: "1.5px solid var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 900,
                        letterSpacing: "0.04em",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      TIER 1: PILIHAN JAWABAN
                    </span>
                    <span
                      className="badge-mono font-mono"
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        backgroundColor: isAnswerOk ? "rgba(14, 164, 122, 0.12)" : "rgba(225, 29, 72, 0.10)",
                        borderColor: isAnswerOk ? "#0EA47A" : "#E11D48",
                        color: isAnswerOk ? "#0B6B50" : "#E11D48",
                      }}
                    >
                      {isAnswerOk ? "✓ JAWABAN BENAR" : "✗ JAWABAN KELIRU"}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {q.options.map((opt, oIdx) => {
                      const isChosen = q.studentAnswer === oIdx;
                      const isCorrect = q.correctOption === oIdx;

                      let borderColor = "var(--color-border)";
                      let bg = "var(--color-surface)";
                      if (isCorrect) {
                        borderColor = "#0EA47A";
                        bg = "rgba(14, 164, 122, 0.08)";
                      } else if (isChosen) {
                        borderColor = "#E11D48";
                        bg = "rgba(225, 29, 72, 0.08)";
                      }

                      return (
                        <div
                          key={oIdx}
                          style={{
                            padding: "8px 10px",
                            backgroundColor: bg,
                            border: `1.5px solid ${borderColor}`,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                            fontSize: "13px",
                            lineHeight: 1.4,
                          }}
                        >
                          <span
                            className="font-mono"
                            style={{
                              width: "20px",
                              height: "20px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10.5px",
                              fontWeight: 900,
                              backgroundColor: isCorrect ? "#0EA47A" : isChosen ? "#E11D48" : "var(--color-surface-dim)",
                              color: isCorrect || isChosen ? "#FFFFFF" : "var(--color-text)",
                              border: "1px solid var(--color-border)",
                              flexShrink: 0,
                            }}
                          >
                            {IDX_TO_LETTER[oIdx]}
                          </span>
                          <span style={{ flex: 1, color: "var(--color-text)" }}>{opt}</span>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                            {isChosen && (
                              <span
                                className="font-mono"
                                style={{
                                  fontSize: "9.5px",
                                  fontWeight: 800,
                                  color: isCorrect ? "#0B6B50" : "#E11D48",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                [PILIHAN SISWA]
                              </span>
                            )}
                            {isCorrect && (
                              <span
                                className="font-mono"
                                style={{
                                  fontSize: "9.5px",
                                  fontWeight: 800,
                                  color: "#0B6B50",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                [KUNCI BENAR]
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tier 2: Pilihan Alasan */}
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "var(--color-surface-dim)",
                    border: "1.5px solid var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 900,
                        letterSpacing: "0.04em",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      TIER 2: PILIHAN ALASAN
                    </span>
                    <span
                      className="badge-mono font-mono"
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        backgroundColor: isReasonOk ? "rgba(14, 164, 122, 0.12)" : "rgba(225, 29, 72, 0.10)",
                        borderColor: isReasonOk ? "#0EA47A" : "#E11D48",
                        color: isReasonOk ? "#0B6B50" : "#E11D48",
                      }}
                    >
                      {isReasonOk ? "✓ ALASAN BENAR" : "✗ ALASAN KELIRU"}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {q.reasons.map((rsn, rIdx) => {
                      const isChosen = q.studentReason === rIdx;
                      const isCorrect = q.correctReason === rIdx;

                      let borderColor = "var(--color-border)";
                      let bg = "var(--color-surface)";
                      if (isCorrect) {
                        borderColor = "#0EA47A";
                        bg = "rgba(14, 164, 122, 0.08)";
                      } else if (isChosen) {
                        borderColor = "#E11D48";
                        bg = "rgba(225, 29, 72, 0.08)";
                      }

                      return (
                        <div
                          key={rIdx}
                          style={{
                            padding: "8px 10px",
                            backgroundColor: bg,
                            border: `1.5px solid ${borderColor}`,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                            fontSize: "13px",
                            lineHeight: 1.4,
                          }}
                        >
                          <span
                            className="font-mono"
                            style={{
                              width: "20px",
                              height: "20px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10.5px",
                              fontWeight: 900,
                              backgroundColor: isCorrect ? "#0EA47A" : isChosen ? "#E11D48" : "var(--color-surface-dim)",
                              color: isCorrect || isChosen ? "#FFFFFF" : "var(--color-text)",
                              border: "1px solid var(--color-border)",
                              flexShrink: 0,
                            }}
                          >
                            {IDX_TO_LETTER[rIdx]}
                          </span>
                          <span style={{ flex: 1, color: "var(--color-text)" }}>{rsn}</span>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                            {isChosen && (
                              <span
                                className="font-mono"
                                style={{
                                  fontSize: "9.5px",
                                  fontWeight: 800,
                                  color: isCorrect ? "#0B6B50" : "#E11D48",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                [PILIHAN SISWA]
                              </span>
                            )}
                            {isCorrect && (
                              <span
                                className="font-mono"
                                style={{
                                  fontSize: "9.5px",
                                  fontWeight: 800,
                                  color: "#0B6B50",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                [KUNCI BENAR]
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tier 3: Tingkat Keyakinan */}
                <div
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "var(--color-surface-dim)",
                    border: "1.5px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 900,
                      letterSpacing: "0.04em",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    TIER 3: TINGKAT KEYAKINAN
                  </span>
                  <span
                    className="badge-mono font-mono"
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 900,
                      backgroundColor: q.confident ? "var(--color-surface)" : "var(--color-surface-dim)",
                      color: q.confident ? "var(--color-accent)" : "var(--color-text-muted)",
                      borderColor: q.confident ? "var(--color-accent)" : "var(--color-border)",
                    }}
                  >
                    {q.confident ? "✦ YAKIN DENGAN JAWABAN" : "○ TIDAK YAKIN (RAGU)"}
                  </span>
                </div>

                {/* Pedagogical Diagnosis Callout */}
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: diag.bg,
                    border: `1.5px solid ${diag.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 900,
                        color: diag.text,
                        letterSpacing: "0.03em",
                      }}
                    >
                      ANALISIS DIAGNOSTIK GURU: {diag.label}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "12.5px",
                      lineHeight: 1.45,
                      color: "var(--color-text)",
                      margin: 0,
                    }}
                  >
                    {diag.desc}
                  </p>
                </div>

                {/* Concept Explanation Box */}
                {q.explanation && (
                  <div
                    style={{
                      padding: "12px 14px",
                      backgroundColor: "var(--color-surface-dim)",
                      border: "1.5px dashed var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 900,
                        color: "var(--color-accent)",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      💡 PENJELASAN KONSEP & ALASAN BENAR
                    </span>
                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.5,
                        color: "var(--color-text)",
                        margin: 0,
                      }}
                    >
                      {q.explanation}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Bottom Back Button */}
        <div style={{ marginTop: "12px" }}>
          <Link
            href={returnUrl}
            className="font-mono boxy-btn boxy-btn-accent boxy-pressable-sm"
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "12px",
              fontWeight: 900,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            ❮ KEMBALI KE DAFTAR SISWA
          </Link>
        </div>
      </main>
    </div>
  );
}
