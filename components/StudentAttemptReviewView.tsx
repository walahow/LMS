"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import type { Diagnosis } from "@/lib/diagnose";

export type ReviewQuestionItem = {
  id: string;
  position: number;
  stem: string;
  options: string[];
  reasons: string[];
  studentAnswer: number;
  studentReason: number;
  correctOption: number;
  correctReason: number;
  confident: boolean;
  diagnosis: Diagnosis;
  explanation?: string;
  indicator?: string;
  subtopic?: string;
  cognitiveLevel?: string;
};

export type StudentAttemptReviewProps = {
  title: string;
  subject?: string;
  grade?: string;
  indicator?: string;
  submittedAt: string;
  score: number;
  questions: ReviewQuestionItem[];
};

const DIAGNOSIS_STYLE: Record<
  Diagnosis,
  { label: string; bg: string; text: string; border: string }
> = {
  paham: {
    label: "MEMAHAMI KONSEP",
    bg: "rgba(14, 164, 122, 0.12)",
    text: "#0B6B50",
    border: "#0EA47A",
  },
  miskonsepsi: {
    label: "MISKONSEPSI",
    bg: "rgba(225, 29, 72, 0.10)",
    text: "#E11D48",
    border: "#E11D48",
  },
  lucky_guess: {
    label: "MENEBAK KONSEP",
    bg: "var(--color-accent-dim)",
    text: "var(--color-accent)",
    border: "var(--color-accent)",
  },
  tidak_paham: {
    label: "TIDAK MEMAHAMI KONSEP",
    bg: "rgba(113, 113, 122, 0.12)",
    text: "var(--color-text-muted)",
    border: "var(--color-border)",
  },
};

const IDX_TO_LETTER = ["A", "B", "C", "D", "E"];

export function StudentAttemptReviewView({
  title,
  subject = "FISIKA",
  grade = "KELAS X",
  indicator,
  submittedAt,
  score,
  questions,
}: StudentAttemptReviewProps) {
  const total = questions.length;
  const tier1Correct = questions.filter((q) => q.studentAnswer === q.correctOption).length;
  const counts = {
    paham: questions.filter((q) => q.diagnosis === "paham").length,
    miskonsepsi: questions.filter((q) => q.diagnosis === "miskonsepsi").length,
    luckyGuess: questions.filter((q) => q.diagnosis === "lucky_guess").length,
    tidakPaham: questions.filter((q) => q.diagnosis === "tidak_paham").length,
  };

  const formattedDate = new Date(submittedAt).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
              ULASAN TES
            </span>
            <span
              className="badge-mono font-mono"
              style={{
                fontSize: "10.5px",
                backgroundColor: "var(--color-accent-dim)",
                borderColor: "var(--color-accent)",
                color: "var(--color-accent)",
              }}
            >
              {subject}
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
        {/* Top Summary Card */}
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

          {/* Title & Date */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="badge-mono font-mono" style={{ fontSize: "10px" }}>
                {grade}
              </span>
              <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                {formattedDate}
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
              {title}
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
                SKOR JAWABAN (TIER 1)
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
                {score} <span style={{ fontSize: "16px", color: "var(--color-text)" }}>/ 100</span>
              </span>
            </div>

            <span
              className="badge-mono font-mono"
              style={{
                fontSize: "11px",
                backgroundColor: score >= 70 ? "rgba(14, 164, 122, 0.12)" : "rgba(225, 29, 72, 0.10)",
                borderColor: score >= 70 ? "#0EA47A" : "#E11D48",
                color: score >= 70 ? "#0B6B50" : "#E11D48",
                fontWeight: 900,
              }}
            >
              {tier1Correct} / {total} TIER 1 BENAR
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
            {/* Memahami konsep */}
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
                MEMAHAMI KONSEP
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

            {/* Menebak konsep */}
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
                MENEBAK KONSEP
              </span>
              <span className="font-mono" style={{ fontSize: "16px", fontWeight: 900, color: DIAGNOSIS_STYLE.lucky_guess.text }}>
                {counts.luckyGuess} / {total}
              </span>
            </div>

            {/* Tidak memahami konsep */}
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
                TIDAK MEMAHAMI KONSEP
              </span>
              <span className="font-mono" style={{ fontSize: "16px", fontWeight: 900, color: "var(--color-text)" }}>
                {counts.tidakPaham} / {total}
              </span>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="badge-mono font-mono" style={{ fontSize: "10px", backgroundColor: "var(--color-text)", color: "var(--color-bg)" }}>
            RINCIAN SOAL
          </span>
          <span className="font-mono" style={{ fontSize: "12px", fontWeight: 800, color: "var(--color-text)" }}>
            EVALUASI JAWABAN 3-TIER
          </span>
        </div>

        {/* Question Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {questions.map((q) => {
            const diag = DIAGNOSIS_STYLE[q.diagnosis] || DIAGNOSIS_STYLE.tidak_paham;
            const isAnswerOk = q.studentAnswer === q.correctOption;
            const isReasonOk = q.studentReason === q.correctReason;

            return (
              <article
                key={q.id}
                className="boxy-card-flat"
                style={{
                  padding: "18px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
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

                {(q.indicator || q.subtopic || q.cognitiveLevel) && (
                  <div
                    style={{
                      padding: "8px 10px",
                      border: "1px dashed var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                      {q.subtopic && (
                        <span className="badge-mono" style={{ fontSize: "9.5px" }}>
                          {q.subtopic}
                        </span>
                      )}
                      {q.cognitiveLevel && (
                        <span className="badge-mono" style={{ fontSize: "9.5px" }}>
                          {q.cognitiveLevel}
                        </span>
                      )}
                    </div>
                    {q.indicator && (
                      <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                        <strong>Indikator:</strong> {q.indicator}
                      </span>
                    )}
                  </div>
                )}

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
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="font-mono" style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-text-muted)" }}>
                      TIER 1 · JAWABAN ANDA
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10px",
                        fontWeight: 900,
                        color: isAnswerOk ? "#0EA47A" : "#E11D48",
                      }}
                    >
                      {isAnswerOk ? "✓ BENAR" : "✗ SALAH"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span
                      className="font-mono"
                      style={{
                        padding: "1px 6px",
                        backgroundColor: isAnswerOk ? "rgba(14, 164, 122, 0.15)" : "rgba(225, 29, 72, 0.15)",
                        border: `1px solid ${isAnswerOk ? "#0EA47A" : "#E11D48"}`,
                        color: isAnswerOk ? "#0EA47A" : "#E11D48",
                        fontWeight: 900,
                        fontSize: "12px",
                        flexShrink: 0,
                      }}
                    >
                      {IDX_TO_LETTER[q.studentAnswer] ?? "?"}
                    </span>
                    <span style={{ fontSize: "13px", lineHeight: 1.4, color: "var(--color-text)" }}>
                      {q.options[q.studentAnswer] ?? "Tidak dijawab"}
                    </span>
                  </div>

                  {!isAnswerOk && (
                    <div
                      style={{
                        marginTop: "6px",
                        padding: "6px 8px",
                        backgroundColor: "rgba(14, 164, 122, 0.08)",
                        borderLeft: "3px solid #0EA47A",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: "10px", fontWeight: 900, color: "#0EA47A" }}>
                        KUNCI: [{IDX_TO_LETTER[q.correctOption]}]
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--color-text)" }}>
                        {q.options[q.correctOption]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tier 2: Pilihan Alasan */}
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "var(--color-surface-dim)",
                    border: "1.5px solid var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="font-mono" style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-text-muted)" }}>
                      TIER 2 · ALASAN ANDA
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10px",
                        fontWeight: 900,
                        color: isReasonOk ? "#0EA47A" : "#E11D48",
                      }}
                    >
                      {isReasonOk ? "✓ BENAR" : "✗ SALAH"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span
                      className="font-mono"
                      style={{
                        padding: "1px 6px",
                        backgroundColor: isReasonOk ? "rgba(14, 164, 122, 0.15)" : "rgba(225, 29, 72, 0.15)",
                        border: `1px solid ${isReasonOk ? "#0EA47A" : "#E11D48"}`,
                        color: isReasonOk ? "#0EA47A" : "#E11D48",
                        fontWeight: 900,
                        fontSize: "12px",
                        flexShrink: 0,
                      }}
                    >
                      {IDX_TO_LETTER[q.studentReason] ?? "?"}
                    </span>
                    <span style={{ fontSize: "13px", lineHeight: 1.4, color: "var(--color-text)" }}>
                      {q.reasons[q.studentReason] ?? "Tidak dijawab"}
                    </span>
                  </div>

                  {!isReasonOk && (
                    <div
                      style={{
                        marginTop: "6px",
                        padding: "6px 8px",
                        backgroundColor: "rgba(14, 164, 122, 0.08)",
                        borderLeft: "3px solid #0EA47A",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: "10px", fontWeight: 900, color: "#0EA47A" }}>
                        KUNCI: [{IDX_TO_LETTER[q.correctReason]}]
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--color-text)" }}>
                        {q.reasons[q.correctReason]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tier 3: Keyakinan */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    backgroundColor: "var(--color-surface-dim)",
                    border: "1.5px solid var(--color-border)",
                  }}
                >
                  <span className="font-mono" style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-text-muted)" }}>
                    TIER 3 · KEYAKINAN
                  </span>
                  <span
                    className="badge-mono font-mono"
                    style={{
                      fontSize: "11px",
                      fontWeight: 900,
                      borderColor: q.confident ? "var(--color-accent)" : "var(--color-border)",
                      color: q.confident ? "var(--color-accent)" : "var(--color-text-muted)",
                      backgroundColor: q.confident ? "var(--color-accent-dim)" : "transparent",
                    }}
                  >
                    {q.confident ? "● YAKIN" : "○ TIDAK YAKIN"}
                  </span>
                </div>

                {/* Misconception Warning Callout */}
                {q.diagnosis === "miskonsepsi" && (
                  <div
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "rgba(225, 29, 72, 0.08)",
                      border: "1.5px solid #E11D48",
                      fontSize: "12px",
                      lineHeight: 1.45,
                      color: "var(--color-text)",
                    }}
                  >
                    <strong style={{ color: "#E11D48" }}>⚠ Peringatan Miskonsepsi: </strong>
                    Anda merasa yakin padahal pilihan jawaban atau alasan belum tepat. Ini menandakan miskonsepsi yang perlu diluruskan.
                  </div>
                )}

                {/* Pedagogical Explanation Box */}
                {q.explanation && (
                  <div
                    style={{
                      padding: "12px 14px",
                      backgroundColor: "var(--color-surface)",
                      border: "1.5px solid var(--color-accent)",
                      boxShadow: "var(--shadow-boxy-accent)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>💡</span>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "11px",
                          fontWeight: 900,
                          color: "var(--color-accent)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        PENJELASAN KONSEP & ALASAN BENAR
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12.5px",
                        lineHeight: 1.5,
                        color: "var(--color-text)",
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

        {/* Bottom Back CTA */}
        <Link
          href="/dashboard"
          className="boxy-btn boxy-btn-accent font-mono boxy-pressable-md"
          style={{
            height: "46px",
            fontSize: "13px",
            fontWeight: 900,
            letterSpacing: "0.04em",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          ❮ KEMBALI KE BERANDA SISWA
        </Link>
      </main>
    </div>
  );
}
