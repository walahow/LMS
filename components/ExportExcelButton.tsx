"use client";

import React, { useState } from "react";

type ExportExcelButtonProps = {
  setId: string;
  scope?: "teacher" | "admin";
  variant?: "secondary" | "compact";
  disabled?: boolean;
  disabledReason?: string;
  label?: string;
};

export function ExportExcelButton({
  setId,
  scope = "teacher",
  variant = "secondary",
  disabled = false,
  disabledReason,
  label,
}: ExportExcelButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = async () => {
    if (disabled || downloading) return;
    setDownloading(true);
    setErrorMsg(null);

    try {
      const qs = scope === "admin" ? "?scope=admin" : "";
      const res = await fetch(`/api/export/sets/${encodeURIComponent(setId)}${qs}`, {
        method: "GET",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Gagal mengunduh file Excel.");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = /filename="([^"]+)"/i.exec(disposition);
      const filename = match?.[1] || `rekap-hasil-${setId}.xlsx`;

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengunduh rekap Excel.");
    } finally {
      setDownloading(false);
    }
  };

  const buttonText = downloading
    ? variant === "compact"
      ? "UNDUH..."
      : "MENYIAPKAN FILE EXCEL..."
    : label || (variant === "compact" ? "⬇ EXCEL" : "⬇ UNDUH REKAP EXCEL (.XLSX)");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        width: variant === "secondary" ? "100%" : "auto",
      }}
    >
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled || downloading}
        title={disabled ? disabledReason || "Belum tersedia untuk paket ini" : "Unduh hasil tes dalam format Excel (.xlsx)"}
        className="font-mono boxy-pressable-sm"
        style={{
          padding: variant === "compact" ? "7px 8px" : "9px 12px",
          fontSize: variant === "compact" ? "10.5px" : "11px",
          fontWeight: 800,
          letterSpacing: "0.03em",
          border: "1.5px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          color: disabled ? "var(--color-text-muted)" : "var(--color-text)",
          cursor: disabled || downloading ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          whiteSpace: "nowrap",
          width: variant === "secondary" ? "100%" : "auto",
        }}
      >
        {buttonText}
      </button>

      {errorMsg && (
        <span
          className="font-mono"
          style={{
            fontSize: "10.5px",
            fontWeight: 700,
            color: "#E11D48",
          }}
        >
          ⚠ {errorMsg}
        </span>
      )}
    </div>
  );
}
