"use client";

import React, { useState } from "react";

export interface BoxyPasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  hint?: string;
}

export function BoxyPasswordInput({
  id,
  name,
  label,
  hint,
  placeholder,
  required = true,
  minLength = 8,
  autoComplete = "new-password",
  style,
  ...props
}: BoxyPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <label
          htmlFor={id}
          className="font-mono"
          style={{
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.03em",
            color: "var(--color-text)",
          }}
        >
          {label}
        </label>
        {hint && (
          <span
            className="font-mono"
            style={{
              fontSize: "10.5px",
              color: "var(--color-text-muted)",
            }}
          >
            {hint}
          </span>
        )}
      </div>

      <div className="boxy-input-group">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={
            showPassword ? placeholder || "Masukkan kata sandi..." : "••••••••"
          }
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
            ...style,
          }}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className={`password-toggle-btn ${showPassword ? "is-active" : ""}`}
          title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          tabIndex={-1}
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
            {/* Inner Eye (Pupil) */}
            <circle cx="12" cy="12" r="3" className="eye-pupil" />
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
  );
}
