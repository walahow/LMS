"use client";

import { useActionState } from "react";
import { createUser, type CreateUserState } from "./actions";

const initialState: CreateUserState = {};

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUser, initialState);

  return (
    <form
      action={formAction}
      style={{
        display: "grid",
        gap: "0.75rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        alignItems: "end",
      }}
    >
      <div className="field">
        <label htmlFor="full_name">Nama Lengkap</label>
        <input id="full_name" name="full_name" required />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="role">Peran</label>
        <select id="role" name="role" defaultValue="student">
          <option value="student">Siswa</option>
          <option value="teacher">Guru</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="password">Kata Sandi Awal</label>
        <input id="password" name="password" type="password" minLength={8} required />
      </div>
      <div className="field">
        <label>&nbsp;</label>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Membuat..." : "Buat Pengguna"}
        </button>
      </div>
      {state.error && (
        <p className="error-text" style={{ gridColumn: "1 / -1" }}>
          {state.error}
        </p>
      )}
      {state.success && (
        <p style={{ gridColumn: "1 / -1", color: "var(--color-success)" }}>{state.success}</p>
      )}
    </form>
  );
}
