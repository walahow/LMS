"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { signIn, type LoginState } from "@/app/(auth)/login/actions";
import { ButtonLoadingBar } from "@/components/ButtonLoadingBar";

const initialState: LoginState = {};

export function LoginView() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Username or Email Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label
                htmlFor="email"
                className="font-mono"
                style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
              >
                USERNAME / EMAIL *
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username atau email@sekolah.sch.id"
                className="boxy-input"
                style={{ fontSize: "13px" }}
              />
            </div>

            {/* Password Field with Integrated Addon Group */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label
                htmlFor="password"
                className="font-mono"
                style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
              >
                KATA SANDI *
              </label>

              {/* Integrated Input Group */}
              <div className="boxy-input-group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={showPassword ? "Masukkan password..." : "••••••••"}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "10px 12px",
                    fontSize: "13px",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--color-text)",
                    fontFamily: "inherit",
                    letterSpacing: showPassword ? "normal" : "0.18em",
                  }}
                />

                {/* Clean Eye Icon Toggle with Animated Top-Left to Bottom-Right Slash */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`password-toggle-btn ${showPassword ? "is-active" : ""}`}
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="eye-icon"
                    aria-hidden="true"
                  >
                    {/* Eye Contour */}
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      className="eye-contour"
                    />
                    {/* Inner Eye (Pupil) - always visible */}
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      className="eye-pupil"
                    />
                    {/* Diagonal slash: draws from top-left (3, 3) to bottom-right (21, 21) */}
                    <line
                      x1="3"
                      y1="3"
                      x2="21"
                      y2="21"
                      className={`eye-slash ${showPassword ? "is-retracted" : ""}`}
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {state?.error && (
              <div
                style={{
                  padding: "8px 12px",
                  border: "1.5px solid var(--color-accent)",
                  backgroundColor: "var(--color-accent-dim)",
                  color: "var(--color-accent)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {state.error}
              </div>
            )}

            {/* Submit Button with Blue Dither Pattern */}
            <button
              type="submit"
              disabled={pending}
              className="boxy-btn-dither-accent font-mono"
              style={{
                marginTop: "4px",
                padding: "13px 18px",
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
              {/* Gradual Right-to-Left Fading Blue Dither Pattern (HYDE style) */}
              <div
                className="dither-fade-right-accent"
                style={{
                  width: "85%",
                  opacity: 0.72,
                  transition: "opacity 0.15s ease",
                }}
                aria-hidden="true"
              />

              <span style={{ position: "relative", zIndex: 1, letterSpacing: "0.06em" }}>
                {pending ? "LOGGING IN..." : "LOG IN"}
              </span>
              <span style={{ position: "relative", zIndex: 1 }}>➔</span>
              {pending && <ButtonLoadingBar variant="contrast" height={3.5} />}
            </button>
          </form>
        </section>

        {/* 3. Register Student Account Callout */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Belum punya akun siswa?
          </div>
          <Link
            href="/register"
            className="boxy-btn-accent font-mono"
            style={{
              padding: "7px 12px",
              fontSize: "11.5px",
              fontWeight: 800,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>DAFTAR SISWA</span>
            <span>➔</span>
          </Link>
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
            Pendaftaran mandiri tersedia untuk akun <strong>Siswa</strong>. Akun Guru dan Administrator dikelola langsung oleh pihak sekolah.
          </span>
        </div>

        {/* 4. Footer */}
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
