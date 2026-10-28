"use client";

import React, { useActionState, useState } from "react";
import { updateQuestion, type UpdateQuestionState } from "./actions";

type QuestionEditorProps = {
  setId: string;
  question: {
    id: string;
    position: number;
    stem: string;
    options: string[];
    correctOption: number;
    reasons: string[];
    correctReason: number;
  };
  index: number;
};

const initialState: UpdateQuestionState = {};

export function QuestionEditor({ setId, question, index }: QuestionEditorProps) {
  const [state, formAction, pending] = useActionState(updateQuestion, initialState);
  const [correctOption, setCorrectOption] = useState(question.correctOption);
  const [correctReason, setCorrectReason] = useState(question.correctReason);
  const [isSavedMock, setIsSavedMock] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // If running in standalone mock mode (setId starts with "mock-")
    if (setId.startsWith("mock-")) {
      e.preventDefault();
      setIsSavedMock(true);
      setTimeout(() => setIsSavedMock(false), 2500);
      return;
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="boxy-card-flat"
      style={{
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <input type="hidden" name="question_id" value={question.id} />
      <input type="hidden" name="set_id" value={setId} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1.5px solid var(--color-border)",
          paddingBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            className="badge-mono"
            style={{
              backgroundColor: "var(--color-text)",
              color: "var(--color-surface)",
              fontSize: "11px",
              padding: "3px 7px",
            }}
          >
            SOAL {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            ID: {question.id}
          </span>
        </div>

        {(state.success || isSavedMock) && (
          <span
            className="badge-mono"
            style={{
              borderColor: "#16A34A",
              backgroundColor: "rgba(22, 163, 74, 0.12)",
              color: "#16A34A",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            ✓ PERUBAHAN TERSIMPAN
          </span>
        )}
      </div>

      {/* Question Stem */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
          htmlFor={`stem-${question.id}`}
          className="font-mono"
          style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
        >
          PERTANYAAN / STEM SOAL *
        </label>
        <textarea
          id={`stem-${question.id}`}
          name="stem"
          rows={3}
          defaultValue={question.stem}
          required
          className="boxy-input"
          style={{ fontSize: "13px", lineHeight: 1.5, resize: "vertical" }}
        />
      </div>

      {/* Tier 1: Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            className="font-mono"
            style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-text)" }}
          >
            PILIHAN JAWABAN (TIER 1)
          </span>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            Pilih satu opsi sebagai kunci benar
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {question.options.map((opt, i) => {
            const isKey = correctOption === i;
            const letter = String.fromCharCode(65 + i);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 8px",
                  border: isKey ? "1.5px solid #16A34A" : "1.5px solid var(--color-border)",
                  backgroundColor: isKey ? "rgba(22, 163, 74, 0.06)" : "var(--color-bg)",
                  boxShadow: "none",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="radio"
                    name="correct_option"
                    value={i}
                    checked={isKey}
                    onChange={() => setCorrectOption(i)}
                    style={{ accentColor: "#16A34A", cursor: "pointer" }}
                    required
                  />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: isKey ? "#16A34A" : "var(--color-text)",
                    }}
                  >
                    {letter}
                  </span>
                </label>

                <input
                  name={`option_${i}`}
                  defaultValue={opt}
                  required
                  style={{
                    flex: 1,
                    fontSize: "12.5px",
                    padding: "6px 10px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--color-text)",
                    fontFamily: "inherit",
                    outline: "none",
                    boxShadow: "none",
                  }}
                />

                {isKey && (
                  <span
                    className="badge-mono"
                    style={{
                      fontSize: "9.5px",
                      borderColor: "#16A34A",
                      color: "#16A34A",
                      flexShrink: 0,
                    }}
                  >
                    KUNCI
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier 2: Reasons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            className="font-mono"
            style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-text)" }}
          >
            PILIHAN ALASAN (TIER 2)
          </span>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            Pilih satu alasan sebagai kunci benar
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {question.reasons.map((rsn, i) => {
            const isKey = correctReason === i;
            const letter = String.fromCharCode(65 + i);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 8px",
                  border: isKey ? "1.5px solid #16A34A" : "1.5px solid var(--color-border)",
                  backgroundColor: isKey ? "rgba(22, 163, 74, 0.06)" : "var(--color-bg)",
                  boxShadow: "none",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="radio"
                    name="correct_reason"
                    value={i}
                    checked={isKey}
                    onChange={() => setCorrectReason(i)}
                    style={{ accentColor: "#16A34A", cursor: "pointer" }}
                    required
                  />
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: isKey ? "#16A34A" : "var(--color-text)",
                    }}
                  >
                    {letter}
                  </span>
                </label>

                <input
                  name={`reason_${i}`}
                  defaultValue={rsn}
                  required
                  style={{
                    flex: 1,
                    fontSize: "12.5px",
                    padding: "6px 10px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--color-text)",
                    fontFamily: "inherit",
                    outline: "none",
                    boxShadow: "none",
                  }}
                />

                {isKey && (
                  <span
                    className="badge-mono"
                    style={{
                      fontSize: "9.5px",
                      borderColor: "#16A34A",
                      color: "#16A34A",
                      flexShrink: 0,
                    }}
                  >
                    KUNCI
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error message */}
      {state?.error && (
        <div
          style={{
            padding: "8px 12px",
            border: "1.5px solid var(--color-accent)",
            backgroundColor: "rgba(255, 40, 0, 0.08)",
            color: "var(--color-accent)",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {state.error}
        </div>
      )}

      {/* Submit Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
        <button
          type="submit"
          disabled={pending}
          className="boxy-pressable-sm font-mono"
          style={{
            padding: "9px 16px",
            border: "1.5px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            fontWeight: 800,
            fontSize: "12px",
            cursor: pending ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>{pending ? "MENYIMPAN..." : "SIMPAN SOAL INI"}</span>
          <span>➔</span>
        </button>
      </div>
    </form>
  );
}
