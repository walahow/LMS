"use client";

import React, { useActionState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { changePassword, signOut, type ChangePasswordState } from "@/lib/auth-actions";
import { BoxyPasswordInput } from "@/components/BoxyPasswordInput";

export type AdminProfileData = {
  fullName: string;
  initials: string;
  email: string;
  roleTitle?: string;
};

const initialPasswordState: ChangePasswordState = {};

export function AdminProfileView({ profile }: { profile: AdminProfileData }) {
  const [state, formAction, pending] = useActionState(changePassword, initialPasswordState);
  const formRef = useRef<HTMLFormElement>(null);

  // Bersihkan form input secara otomatis saat kata sandi berhasil diperbarui
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

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
      {/* 1. Sticky Header */}
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
          {/* Back to Admin Hub Button */}
          <Link
            href="/admin/dashboard"
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
            <span>KEMBALI KE ADMIN HUB</span>
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
            PENGATURAN AKUN ADMINISTRATOR
          </span>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "-0.01em",
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Profil & Keamanan
          </h1>
        </div>

        {/* 3. Identity Card */}
        <div
          className="boxy-card-flat"
          style={{
            padding: "20px 18px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Tactile Boxy Avatar */}
          <div
            className="font-mono"
            style={{
              width: "56px",
              height: "56px",
              flexShrink: 0,
              border: "2px solid var(--color-border)",
              backgroundColor: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "20px",
              boxShadow: "var(--shadow-boxy-accent)",
            }}
          >
            {profile.initials}
          </div>

          {/* Identity Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "var(--color-text)",
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {profile.fullName}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span
                className="badge-mono"
                style={{
                  fontSize: "10.5px",
                  borderColor: "var(--color-accent)",
                  backgroundColor: "var(--color-accent-dim)",
                  color: "var(--color-accent)",
                }}
              >
                ADMINISTRATOR SISTEM
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-mono), monospace",
                wordBreak: "break-all",
              }}
            >
              {profile.email}
            </span>
          </div>
        </div>

        {/* 4. Security & Change Password Card */}
        <div
          className="boxy-card-flat"
          style={{
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "7px",
                  height: "7px",
                  backgroundColor: "var(--color-accent)",
                }}
              />
              <span
                className="font-mono"
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: "var(--color-text)",
                  textTransform: "uppercase",
                }}
              >
                Keamanan & Kata Sandi
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              Ubah kata sandi akun administrator Anda untuk menjaga keamanan akses server & data.
            </p>
          </div>

          {/* Form */}
          <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Error Feedback */}
            {state?.error && (
              <div
                className="font-mono"
                style={{
                  padding: "9px 12px",
                  border: "1.5px solid var(--color-accent)",
                  backgroundColor: "var(--color-accent-dim)",
                  color: "var(--color-accent)",
                  fontSize: "12px",
                  fontWeight: 700,
                  lineHeight: 1.45,
                }}
              >
                ⚠ {state.error}
              </div>
            )}

            {/* Success Feedback */}
            {state?.success && (
              <div
                className="font-mono"
                style={{
                  padding: "9px 12px",
                  border: "1.5px solid #16A34A",
                  backgroundColor: "rgba(22, 163, 74, 0.08)",
                  color: "#16A34A",
                  fontSize: "12px",
                  fontWeight: 700,
                  lineHeight: 1.45,
                }}
              >
                ✓ {state.message || "Kata sandi berhasil diperbarui!"}
              </div>
            )}

            {/* New Password with Show Password Toggle */}
            <BoxyPasswordInput
              id="adminNewPassword"
              name="password"
              label="KATA SANDI BARU"
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="Minimal 8 karakter"
            />

            {/* Confirm Password with Show Password Toggle */}
            <BoxyPasswordInput
              id="adminConfirmPassword"
              name="confirm"
              label="KONFIRMASI KATA SANDI"
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="Ulangi kata sandi baru"
            />

            <button
              type="submit"
              disabled={pending}
              className="boxy-pressable-sm font-mono boxy-btn boxy-btn-accent"
              style={{
                marginTop: "4px",
                width: "100%",
                height: "44px",
                fontWeight: 900,
                fontSize: "12.5px",
                letterSpacing: "0.04em",
                cursor: pending ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: pending ? 0.7 : 1,
              }}
            >
              <span>{pending ? "MENYIMPAN..." : "SIMPAN KATA SANDI"}</span>
              <span>➔</span>
            </button>
          </form>
        </div>

        {/* 5. Logout Card */}
        <div
          className="boxy-card-flat"
          style={{
            padding: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--color-text)" }}>
              Keluar Sesi Admin
            </span>
            <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>
              Akhiri sesi login administrator pada perangkat ini
            </span>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              onClick={() => {
                try {
                  document.cookie = "lms-demo-role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                } catch {}
              }}
              className="boxy-pressable-sm font-mono"
              style={{
                padding: "8px 14px",
                border: "1.5px solid var(--color-accent)",
                backgroundColor: "var(--color-accent-dim)",
                color: "var(--color-accent)",
                fontSize: "11.5px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              KELUAR ➔
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
