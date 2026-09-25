"use client";

import { useActionState } from "react";
import { generateQuestionSet, type GenerateSetState } from "./actions";

const initialState: GenerateSetState = {};

export function GenerateForm() {
  const [state, formAction, pending] = useActionState(generateQuestionSet, initialState);
  const values = state.values;

  return (
    <form
      // Remounts the form (and its uncontrolled fields) on every failed
      // attempt so the defaultValues below re-apply — see the comment on
      // GenerateSetState in actions.ts for why that's needed.
      key={state.attempt ?? 0}
      action={formAction}
      style={{
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        alignItems: "end",
      }}
    >
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label htmlFor="title">Judul Set Soal</label>
        <input id="title" name="title" defaultValue={values?.title} required />
      </div>
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label htmlFor="indicator">Indikator</label>
        <textarea id="indicator" name="indicator" rows={2} defaultValue={values?.indicator} required />
      </div>
      <div className="field">
        <label htmlFor="subject">Mata Pelajaran</label>
        <input id="subject" name="subject" defaultValue={values?.subject} />
      </div>
      <div className="field">
        <label htmlFor="grade">Kelas/Jenjang</label>
        <input id="grade" name="grade" defaultValue={values?.grade} />
      </div>
      <div className="field">
        <label htmlFor="difficulty">Tingkat Kesulitan</label>
        <select id="difficulty" name="difficulty" defaultValue={values?.difficulty ?? "sedang"}>
          <option value="mudah">Mudah</option>
          <option value="sedang">Sedang</option>
          <option value="sulit">Sulit</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="count">Jumlah Soal</label>
        <input
          id="count"
          name="count"
          type="number"
          min={1}
          max={20}
          defaultValue={values?.count ?? "5"}
          required
        />
      </div>
      <div>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Membuat soal..." : "Buat dengan AI"}
        </button>
      </div>
      {state.error && (
        <p className="error-text" style={{ gridColumn: "1 / -1" }}>
          {state.error}
        </p>
      )}
    </form>
  );
}
