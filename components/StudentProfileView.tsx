"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { changePassword, signOut, type ChangePasswordState } from "@/lib/auth-actions";

export type StudentProfileData = {
  fullName: string;
  initials: string;
  email: string;
  grade?: string;
};

const initialPasswordState: ChangePasswordState = {};

export function StudentProfileView({ profile }: { profile: StudentProfileData }) {
  const [state, formAction, pending] = useActionState(changePassword, initialPasswordState);

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
      {/* 1. Mobile-First Sticky Header */}
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
            maxWidth: "440px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {/* Back to Dashboard Button */}
          <Link
            href="/dashboard"
            className="font-mono boxy-btn boxy-pressable-sm"
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
            }}
          >
            ❮ KEMBALI
          </Link>

          {/* Center Title */}
          <span
            className="font-mono"
            style={{
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.04em",
              color: "var(--color-text)",
            }}
          >
            PROFIL SISWA
          </span>

          {/* Right: Theme Toggler */}
          <ThemeToggler />
        </div>
      </header>

      {/* 2. Main Scrollable Container */}
      <main
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "20px 12px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          flex: 1,
        }}
      >
        {/* Section 1: Identity Card */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "20px 18px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Avatar Initials Badge */}
          <div
            className="font-mono"
            style={{
              width: "56px",
              height: "56px",
              border: "2px solid var(--color-border)",
              backgroundColor: "var(--color-surface-dim)",
              boxShadow: "var(--shadow-boxy-accent)",
              color: "var(--color-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            {profile.initials}
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexGrow: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
                color: "var(--color-text)",
              }}
            >
              {profile.fullName}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span
                className="font-mono"
                style={{
                  fontSize: "10.5px",
                  fontWeight: 800,
                  padding: "2px 6px",
                  backgroundColor: "var(--color-surface-dim)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  letterSpacing: "0.03em",
                }}
              >
                {profile.grade ? `SISWA · ${profile.grade}` : "SISWA"}
              </span>
            </div>

            <span
              className="font-mono"
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                marginTop: "2px",
                wordBreak: "break-all",
              }}
            >
              {profile.email}
            </span>
          </div>
        </section>

        {/* Section 2: Security (Ubah Kata Sandi) */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              className="font-mono"
              style={{
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                padding: "2px 6px",
                backgroundColor: "var(--color-text)",
                color: "var(--color-bg)",
              }}
            >
              KEAMANAN
            </span>
            <h2
              className="font-mono"
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                color: "var(--color-text)",
              }}
            >
              UBAH KATA SANDI
            </h2>
          </div>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* New Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="password"
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                  color: "var(--color-text)",
                }}
              >
                KATA SANDI BARU
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Minimal 8 karakter"
                className="boxy-input"
              />
            </div>

            {/* Confirm Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="confirm"
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                  color: "var(--color-text)",
                }}
              >
                KONFIRMASI KATA SANDI
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Ulangi kata sandi baru"
                className="boxy-input"
              />
            </div>

            {/* Status alerts */}
            {state.error && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "rgba(255, 40, 0, 0.08)",
                  border: "1.5px solid var(--color-accent)",
                  fontSize: "12px",
                  color: "var(--color-accent)",
                  fontWeight: 600,
                }}
              >
                {state.error}
              </div>
            )}

            {state.success && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "rgba(14, 164, 122, 0.10)",
                  border: "1.5px solid #0EA47A",
                  fontSize: "12px",
                  color: "#0EA47A",
                  fontWeight: 600,
                }}
              >
                ✓ Kata sandi berhasil diperbarui.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="boxy-btn boxy-btn-accent font-mono boxy-pressable-md"
              style={{
                width: "100%",
                height: "44px",
                fontSize: "12.5px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                marginTop: "4px",
                cursor: pending ? "wait" : "pointer",
                opacity: pending ? 0.7 : 1,
              }}
            >
              {pending ? "MENYIMPAN..." : "SIMPAN KATA SANDI ➔"}
            </button>
          </form>
        </section>

        {/* Section 3: Logout Button */}
        <section style={{ marginTop: "4px" }}>
          <form action={signOut}>
            <button
              type="submit"
              className="boxy-btn font-mono boxy-pressable-md"
              style={{
                width: "100%",
                height: "46px",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-accent)",
                border: "2px solid var(--color-accent)",
                boxShadow: "var(--shadow-boxy-accent)",
                fontSize: "13px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              KELUAR DARI AKUN ➔
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
