"use client";

import { useActionState, useState } from "react";
import { resetPassword, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button className="btn btn-secondary" type="button" onClick={() => setOpen(true)}>
        Reset
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="user_id" value={userId} />
      <input
        type="password"
        name="password"
        placeholder="Kata sandi baru"
        minLength={8}
        required
        style={{
          padding: "0.4rem 0.6rem",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface)",
          color: "var(--color-text)",
        }}
      />
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "..." : "Simpan"}
      </button>
      {state.error && <span className="error-text">{state.error}</span>}
      {state.success && <span style={{ color: "var(--color-success)" }}>{state.success}</span>}
    </form>
  );
}
