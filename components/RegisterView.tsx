"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { registerStudent, type RegisterState } from "@/app/(auth)/register/actions";
import { BoxyPasswordInput } from "@/components/BoxyPasswordInput";
import { ButtonLoadingBar } from "@/components/ButtonLoadingBar";

const initialState: RegisterState = {};

export function RegisterView() {
  const [state, formAction, pending] = useActionState(registerStudent, initialState);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [grade, setGrade] = useState("");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-sanitize as typed: lowercase, only alphanumeric, underscore, dot, dash
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    setUsername(clean);
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
              <div
                style={{
                  height: "5px",
                  width: "36px",
                  backgroundColor: "var(--color-accent)",
                }}
              />
              <div
                style={{
                  height: "5px",
                  width: "24px",
                  backgroundColor: "var(--color-text)",
                  opacity: 0.7,
                }}
              />
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
                borderColor: "var(--color-accent)",
                backgroundColor: "var(--color-accent-dim)",
                color: "var(--color-accent)",
              }}
            >
              REGISTRASI SISWA
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
                margin: 0,
                fontSize: "12.5px",
                color: "var(--color-text-muted)",
                lineHeight: 1.45,
              }}
            >
              Daftar akun siswa baru untuk mulai mengerjakan tes diagnostik 3-tier.
            </p>
          </div>
        </section>

        {/* 2. Registration Form Card */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "22px 20px",
            position: "relative",
          }}
        >
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* General Error Banner */}
            {state?.error && (
              <div
                style={{
                  padding: "9px 12px",
                  border: "1.5px solid var(--color-accent)",
                  backgroundColor: "var(--color-accent-dim)",
                  color: "var(--color-accent)",
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {state.error}
              </div>
            )}

            {/* Nama Lengkap */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label
                htmlFor="reg-fullName"
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                  color: "var(--color-text)",
                }}
              >
                NAMA LENGKAP
              </label>
              <input
                id="reg-fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="misal: Hermione Granger"
                className="boxy-input"
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  borderColor: state?.fieldErrors?.fullName ? "var(--color-accent)" : undefined,
                }}
              />
              {state?.fieldErrors?.fullName && (
                <span style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: 600 }}>
                  {state.fieldErrors.fullName}
                </span>
              )}
            </div>

            {/* Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label
                  htmlFor="reg-username"
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.03em",
                    color: "var(--color-text)",
                  }}
                >
                  USERNAME
                </label>
                <span className="font-mono" style={{ fontSize: "10.5px", color: "var(--color-text-muted)" }}>
                  (untuk login)
                </span>
              </div>
              <input
                id="reg-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="misal: hermione"
                className="boxy-input"
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  borderColor: state?.fieldErrors?.username ? "var(--color-accent)" : undefined,
                }}
              />
              {state?.fieldErrors?.username ? (
                <span style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: 600 }}>
                  {state.fieldErrors.username}
                </span>
              ) : (
                <span style={{ fontSize: "10.5px", color: "var(--color-text-muted)" }}>
                  Gunakan 3–20 karakter huruf kecil, angka, titik, atau garis bawah.
                </span>
              )}
            </div>

            {/* Kelas / Rombel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label
                htmlFor="reg-grade"
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                  color: "var(--color-text)",
                }}
              >
                KELAS / ROMBEL
              </label>
              <input
                id="reg-grade"
                name="grade"
                type="text"
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="misal: Kelas X-A atau 10 MIPA 1"
                className="boxy-input"
                style={{
                  padding: "10px 12px",
                  fontSize: "13px",
                  borderColor: state?.fieldErrors?.grade ? "var(--color-accent)" : undefined,
                }}
              />
              {state?.fieldErrors?.grade && (
                <span style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: 600 }}>
                  {state.fieldErrors.grade}
                </span>
              )}
            </div>

            {/* Kata Sandi */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <BoxyPasswordInput
                id="reg-password"
                name="password"
                label="KATA SANDI"
                hint="Min. 8 karakter"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Masukkan kata sandi..."
              />
              {state?.fieldErrors?.password && (
                <span style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: 600 }}>
                  {state.fieldErrors.password}
                </span>
              )}
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <BoxyPasswordInput
                id="reg-confirmPassword"
                name="confirmPassword"
                label="KONFIRMASI KATA SANDI"
                hint="Ulangi sandi"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Ulangi kata sandi..."
              />
              {state?.fieldErrors?.confirmPassword && (
                <span style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: 600 }}>
                  {state.fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="boxy-btn-dither-accent font-mono"
              style={{
                marginTop: "6px",
                padding: "13px 18px",
                fontWeight: 800,
                fontSize: "13px",
                cursor: pending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: pending ? 0.75 : 1,
                position: "relative",
              }}
            >
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
                {pending ? "MENDAFTARKAN..." : "DAFTAR SEBAGAI SISWA"}
              </span>
              <span style={{ position: "relative", zIndex: 1 }}>➔</span>
              {pending && <ButtonLoadingBar variant="contrast" height={3.5} />}
            </button>
          </form>
        </section>

        {/* 3. Link to Login */}
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
            Sudah memiliki akun?
          </div>
          <Link
            href="/login"
            className="boxy-btn font-mono"
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
            <span>MASUK DI SINI</span>
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
            Halaman ini khusus untuk pendaftaran akun <strong>Siswa</strong>. Akun Guru dan Administrator disiapkan langsung oleh pihak sekolah.
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
