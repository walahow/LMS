"use client";

import { useActionState } from "react";
import { updateQuestion, type UpdateQuestionState } from "./actions";
import type { Database } from "@/lib/database.types";

const initialState: UpdateQuestionState = {};

export function QuestionEditor({
  setId,
  question,
  index,
}: {
  setId: string;
  question: Database["public"]["Tables"]["questions"]["Row"];
  index: number;
}) {
  const [state, formAction, pending] = useActionState(updateQuestion, initialState);

  return (
    <form action={formAction} className="card" style={{ marginBottom: "1rem" }}>
      <input type="hidden" name="question_id" value={question.id} />
      <input type="hidden" name="set_id" value={setId} />

      <h3 style={{ marginTop: 0 }}>Soal {index + 1}</h3>

      <div className="field">
        <label htmlFor={`stem-${question.id}`}>Pertanyaan</label>
        <textarea id={`stem-${question.id}`} name="stem" rows={2} defaultValue={question.stem} required />
      </div>

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 1rem" }}>
        <legend style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
          Opsi Jawaban (pilih yang benar)
        </legend>
        {question.options.map((opt, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
            <input
              type="radio"
              name="correct_option"
              value={i}
              defaultChecked={question.correct_option === i}
              required
            />
            <input name={`option_${i}`} defaultValue={opt} required style={{ flex: 1 }} />
          </div>
        ))}
      </fieldset>

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 1rem" }}>
        <legend style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
          Opsi Alasan (pilih yang benar)
        </legend>
        {question.reasons.map((reason, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
            <input
              type="radio"
              name="correct_reason"
              value={i}
              defaultChecked={question.correct_reason === i}
              required
            />
            <input name={`reason_${i}`} defaultValue={reason} required style={{ flex: 1 }} />
          </div>
        ))}
      </fieldset>

      {state.error && <p className="error-text">{state.error}</p>}
      {state.success && <p style={{ color: "var(--color-success)" }}>Tersimpan.</p>}

      <button className="btn btn-secondary" type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan Soal"}
      </button>
    </form>
  );
}
