import React from "react";

export interface SpinnerProps {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
}

export function Spinner({
  label = "MEMUAT DATA...",
  sublabel = "LMS DIAGNOSTIK",
  fullScreen = true,
}: SpinnerProps) {
  const content = (
    <div
      className="boxy-card-flat"
      style={{
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        maxWidth: "300px",
        width: "100%",
        border: "2px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        boxShadow: "var(--shadow-ambient-card), var(--shadow-boxy-sm)",
        textAlign: "center",
      }}
      role="status"
      aria-label={label}
    >
      {/* Neo-Brutalist Geometric Dual Loader */}
      <div
        style={{
          position: "relative",
          width: "52px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer High-Precision Accent Ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid var(--color-surface-dim)",
            borderTopColor: "var(--color-accent)",
            borderRightColor: "var(--color-accent)",
            animation: "spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          }}
        />

        {/* Inner Counter-Rotating Tactile Spark Box */}
        <div
          className="font-mono"
          style={{
            width: "22px",
            height: "22px",
            backgroundColor: "var(--color-accent-dim)",
            border: "1.5px solid var(--color-accent)",
            color: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 900,
            animation: "spin 2s linear infinite reverse",
            userSelect: "none",
          }}
        >
          ✦
        </div>
      </div>

      {/* Label and Diagnostic Subtitle */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
        <span
          className="font-mono"
          style={{
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "var(--color-text)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className="font-mono"
            style={{
              fontSize: "10.5px",
              color: "var(--color-text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg)",
        padding: "20px",
      }}
    >
      {content}
    </div>
  );
}
