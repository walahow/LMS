"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main
      style={{
        display: "flex",
        minHeight: "100dvh",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <form action={formAction} className="card" style={{ width: "100%", maxWidth: 360 }}>
        <h1 className="brand" style={{ marginTop: 0, fontSize: "1.75rem" }}>
          LMS Diagnostik
        </h1>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem", color: "var(--color-text-muted)" }}>Masuk</h2>
        <p style={{ color: "var(--color-text-muted)", marginTop: "-0.5rem" }}>
          Gunakan akun yang diberikan oleh admin sekolah Anda.
        </p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
        </div>

        <div className="field">
          <label htmlFor="password">Kata Sandi</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>

        {state.error && <p className="error-text">{state.error}</p>}

        <button className="btn" type="submit" disabled={pending} style={{ width: "100%" }}>
          {pending ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
