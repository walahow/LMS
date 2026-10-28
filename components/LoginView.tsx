"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { signIn, type LoginState } from "@/app/(auth)/login/actions";

const initialState: LoginState = {};

export function LoginView() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);

  // Quick fill demo credentials
  const fillDemoAccount = (role: "student" | "teacher" | "admin") => {
    setSelectedDemoRole(role);
    if (role === "student") {
      setEmail("rani@lms.local");
      setPassword("password123");
    } else if (role === "teacher") {
      setEmail("teacher@lms.local");
      setPassword("password123");
    } else if (role === "admin") {
      setEmail("admin@lms.local");
      setPassword("password123");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg)",
        padding: "24px 16px 40px",
        position: "relative",
      }}
    >
      {/* Main Container */}
      <main
        style={{
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* 1. Hero Brand Card */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "22px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
          }}
        >
          {/* 3-Tier Visual Bars & Brand Mark */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "3.5px" }}>
              {/* Tier 1 Bar */}
              <div
                style={{
                  height: "5px",
                  width: "36px",
                  backgroundColor: "var(--color-accent)",
                }}
              />
              {/* Tier 2 Bar */}
              <div
                style={{
                  height: "5px",
                  width: "24px",
                  backgroundColor: "var(--color-text)",
                  opacity: 0.7,
                }}
              />
              {/* Tier 3 Bar */}
              <div
                style={{
                  height: "5px",
                  width: "14px",
                  backgroundColor: "var(--color-border)",
                }}
              />
            </div>

            <span
              className="badge-mono"
              style={{
                fontSize: "10px",
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
            >
              TES 3-TIER DIAGNOSTIK
            </span>
          </div>

          <div>
            <h1
              className="font-mono"
              style={{
                fontSize: "20px",
                fontWeight: 900,
                letterSpacing: "-0.01em",
                margin: "0 0 4px",
                color: "var(--color-text)",
              }}
            >
              LMS DIAGNOSTIK
            </h1>
            <p
              style={{
                fontSize: "12.5px",
                color: "var(--color-text-muted)",
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              Tes diagnostik tiga tingkat: mengevaluasi pilihan jawaban, penalaran alasan, dan tingkat keyakinan konsep.
            </p>
          </div>
        </section>

        {/* 2. Login Form Card */}
        <section
          className="boxy-card-active"
          style={{
            padding: "20px 20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            borderColor: "var(--color-accent)",
            boxShadow: "var(--shadow-boxy-accent)",
          }}
        >
          <div style={{ borderBottom: "1.5px solid var(--color-border)", paddingBottom: "10px" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 800,
                margin: "0 0 2px",
                color: "var(--color-text)",
              }}
            >
              Masuk ke Akun Anda
            </h2>
            <p style={{ fontSize: "11.5px", color: "var(--color-text-muted)", margin: 0 }}>
              Gunakan email dan kata sandi yang telah didaftarkan sekolah.
            </p>
          </div>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input type="hidden" name="demoRole" value={selectedDemoRole ?? ""} />
            {/* Email Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label
                htmlFor="email"
                className="font-mono"
                style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
              >
                ALAMAT EMAIL *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedDemoRole(null);
                }}
                placeholder="nama@sekolah.sch.id"
                className="boxy-input"
                style={{ fontSize: "13px" }}
              />
            </div>

            {/* Password Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label
                  htmlFor="password"
                  className="font-mono"
                  style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                >
                  KATA SANDI *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="font-mono"
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? "SEMBUNYIKAN 👁" : "LIHAT 👁"}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setSelectedDemoRole(null);
                }}
                placeholder="••••••••"
                className="boxy-input"
                style={{ fontSize: "13px" }}
              />
            </div>

            {/* Error Banner */}
            {state?.error && (
              <div
                style={{
                  padding: "8px 12px",
                  border: "1.5px solid var(--color-accent)",
                  backgroundColor: "rgba(255, 40, 0, 0.08)",
                  color: "var(--color-accent)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {state.error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="boxy-pressable-md font-mono"
              style={{
                marginTop: "6px",
                padding: "13px 18px",
                backgroundColor: "var(--color-accent)",
                color: "var(--color-accent-contrast)",
                border: "2px solid var(--color-border)",
                boxShadow: "var(--shadow-boxy)",
                fontWeight: 800,
                fontSize: "13px",
                cursor: pending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: pending ? 0.75 : 1,
              }}
            >
              <span>{pending ? "MEMPROSES MASUK..." : "MASUK KE SISTEM"}</span>
              <span>➔</span>
            </button>
          </form>
        </section>

        {/* 3. Quick 1-Click Demo Account Shortcuts */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: "var(--color-accent)",
                display: "inline-block",
              }}
            />
            <span
              className="font-mono"
              style={{
                fontSize: "10.5px",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
              }}
            >
              AKUN DEMO CEPAT (1-KLIK)
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "6px",
            }}
          >
            {/* Student Shortcut */}
            <Link
              href="/dashboard"
              className="boxy-pressable-sm font-mono"
              style={{
                padding: "10px 4px",
                fontSize: "11px",
                fontWeight: 800,
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <span style={{ fontSize: "16px" }}>🎓</span>
              <span>SISWA ➔</span>
            </Link>

            {/* Teacher Shortcut */}
            <Link
              href="/teacher/dashboard"
              className="boxy-pressable-sm font-mono"
              style={{
                padding: "10px 4px",
                fontSize: "11px",
                fontWeight: 800,
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <span style={{ fontSize: "16px" }}>👩‍🏫</span>
              <span>GURU ➔</span>
            </Link>

            {/* Admin Shortcut */}
            <Link
              href="/admin/dashboard"
              className="boxy-pressable-sm font-mono"
              style={{
                padding: "10px 4px",
                fontSize: "11px",
                fontWeight: 800,
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <span style={{ fontSize: "16px" }}>⚙</span>
              <span>ADMIN ➔</span>
            </Link>
          </div>
        </section>

        {/* 4. Policy Callout */}
        <div
          style={{
            padding: "10px 14px",
            border: "1.5px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontSize: "11.5px",
            color: "var(--color-text-muted)",
            lineHeight: 1.45,
          }}
        >
          <span style={{ color: "var(--color-accent)", fontWeight: 800 }}>ℹ</span>
          <span>
            Akun dibuat dan dikelola oleh admin sekolah. Halaman ini sengaja tidak menyediakan tombol registrasi mandiri.
          </span>
        </div>

        {/* 5. Footer */}
        <p
          className="font-mono"
          style={{
            margin: "4px 0 0",
            textAlign: "center",
            fontSize: "11px",
            color: "var(--color-text-muted)",
          }}
        >
          SMA Nusantara · Tahun Ajaran 2026/2027
        </p>
      </main>
    </div>
  );
}
