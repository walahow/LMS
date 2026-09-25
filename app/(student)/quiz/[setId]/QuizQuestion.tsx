"use client";

import { useState } from "react";
import { submitResponse } from "./actions";
import type { QuestionForStudent } from "@/lib/database.types";

function optionStyle(locked: boolean, selected: boolean, isChosen: boolean) {
  return {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    padding: "0.6rem",
    border: `1px solid ${isChosen ? "var(--color-primary)" : "var(--color-border)"}`,
    borderRadius: "var(--radius-md)",
    marginBottom: "0.5rem",
    cursor: locked ? "default" : "pointer",
    pointerEvents: locked ? ("none" as const) : ("auto" as const),
    opacity: locked && !isChosen ? 0.55 : 1,
  };
}

export function QuizQuestion({
  attemptId,
  setId,
  question,
}: {
  attemptId: string;
  setId: string;
  question: QuestionForStudent;
}) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [reason, setReason] = useState<number | null>(null);
  const [confident, setConfident] = useState<boolean | null>(null);

  return (
    <form action={submitResponse} className="card">
      <input type="hidden" name="attempt_id" value={attemptId} />
      <input type="hidden" name="question_id" value={question.id} />
      <input type="hidden" name="set_id" value={setId} />
      <input type="hidden" name="confident" value={confident === null ? "" : String(confident)} />

      <h2 style={{ marginTop: 0 }}>{question.stem}</h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>Pilih Jawaban</p>
        {question.options.map((opt, i) => (
          <label key={i} style={optionStyle(answer !== null, false, answer === i)}>
            <input
              type="radio"
              name="answer"
              value={i}
              checked={answer === i}
              onChange={() => {
                if (answer === null) setAnswer(i);
              }}
            />
            {opt}
          </label>
        ))}
      </div>

      {answer !== null && (
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>Pilih Alasan</p>
          {question.reasons.map((r, i) => (
            <label key={i} style={optionStyle(reason !== null, false, reason === i)}>
              <input
                type="radio"
                name="reason"
                value={i}
                checked={reason === i}
                onChange={() => {
                  if (reason === null) setReason(i);
                }}
              />
              {r}
            </label>
          ))}
        </div>
      )}

      {reason !== null && (
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>Seberapa yakin Anda?</p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className={confident === true ? "btn" : "btn btn-secondary"}
              onClick={() => setConfident(true)}
            >
              Yakin
            </button>
            <button
              type="button"
              className={confident === false ? "btn" : "btn btn-secondary"}
              onClick={() => setConfident(false)}
            >
              Tidak Yakin
            </button>
          </div>
        </div>
      )}

      {confident !== null && (
        <button className="btn" type="submit">
          Konfirmasi &amp; Lanjutkan
        </button>
      )}
    </form>
  );
}
