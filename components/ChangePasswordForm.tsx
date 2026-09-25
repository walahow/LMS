"use client";

import { useActionState } from "react";
import { changePassword, type ChangePasswordState } from "@/lib/auth-actions";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="card" style={{ maxWidth: 360 }}>
      <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Ubah Kata Sandi</h2>
      <div className="field">
        <label htmlFor="password">Kata Sandi Baru</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <div className="field">
        <label htmlFor="confirm">Konfirmasi Kata Sandi</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      {state.error && <p className="error-text">{state.error}</p>}
      {state.success && <p style={{ color: "var(--color-success)" }}>Kata sandi berhasil diubah.</p>}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
