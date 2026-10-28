"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { changePassword, signOut, type ChangePasswordState } from "@/lib/auth-actions";

export type TeacherProfileData = {
  fullName: string;
  initials: string;
  email: string;
  roleTitle?: string;
};

const initialPasswordState: ChangePasswordState = {};

export function TeacherProfileView({ profile }: { profile: TeacherProfileData }) {
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
            maxWidth: "460px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {/* Back to Teacher Dashboard Button */}
          <Link
            href="/teacher/dashboard"
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
            <span>❮</span>
            <span>KEMBALI KE BERANDA</span>
          </Link>

          {/* Theme Toggler */}
          <ThemeToggler />
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "24px 16px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Page Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "var(--color-accent)",
              textTransform: "uppercase",
            }}
          >
            PENGATURAN AKUN GURU
          </span>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 900,
              letterSpacing: "-0.01em",
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Profil & Keamanan
          </h1>
        </div>

        {/* Identity Card */}
        <div
          className="boxy-card-flat"
          style={{
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            border: "1.5px solid var(--color-border)",
          }}
        >
          {/* Avatar Box */}
          <div
            className="font-mono"
            style={{
              width: "52px",
              height: "52px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--color-accent-dim)",
              border: "1.5px solid var(--color-accent)",
              color: "var(--color-accent)",
              fontWeight: 900,
              fontSize: "18px",
            }}
          >
            {profile.initials}
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flexGrow: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 900,
                  color: "var(--color-text)",
                  lineHeight: 1.2,
                }}
              >
                {profile.fullName}
              </span>
              <span
                className="badge-mono"
                style={{
                  fontSize: "9.5px",
                  padding: "1px 5px",
                  backgroundColor: "var(--color-surface-dim)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                {profile.roleTitle || "GURU PENGAMPU"}
              </span>
            </div>
            <span
              className="font-mono"
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile.email}
            </span>
          </div>
        </div>

        {/* Change Password Form */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            border: "1.5px solid var(--color-border)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Ganti Kata Sandi
            </h2>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
              Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.
            </p>
          </div>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {state.error && (
              <div
                className="font-mono"
                style={{
                  padding: "8px 10px",
                  backgroundColor: "var(--color-accent-dim)",
                  border: "1px solid var(--color-accent)",
                  color: "var(--color-accent)",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                ⚠ {state.error}
              </div>
            )}

            {state.success && (
              <div
                className="font-mono"
                style={{
                  padding: "8px 10px",
                  backgroundColor: "rgba(14, 164, 122, 0.12)",
                  border: "1px solid #0EA47A",
                  color: "#0B6B50",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                ✓ {state.success}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label
                htmlFor="currentPassword"
                className="font-mono"
                style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-text-muted)" }}
              >
                KATA SANDI SAAT INI
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                className="boxy-input font-mono"
                style={{ fontSize: "13px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label
                htmlFor="newPassword"
                className="font-mono"
                style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-text-muted)" }}
              >
                KATA SANDI BARU
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="boxy-input font-mono"
                style={{ fontSize: "13px" }}
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="boxy-btn boxy-btn-accent font-mono boxy-pressable-md"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "12.5px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                marginTop: "4px",
              }}
            >
              {pending ? "MENYIMPAN..." : "SIMPAN KATA SANDI ➔"}
            </button>
          </form>
        </section>

        {/* Sign Out Card */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            border: "1.5px solid var(--color-border)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Sesi & Keamanan
            </h2>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
              Keluar dari akun Anda di perangkat ini.
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              onClick={() => {
                try {
                  document.cookie = "lms-demo-role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                } catch {}
              }}
              className="boxy-btn font-mono boxy-pressable-sm"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "12px",
                fontWeight: 800,
                backgroundColor: "var(--color-surface-dim)",
                borderColor: "var(--color-border)",
                color: "var(--color-accent)",
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
