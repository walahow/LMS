"use client";

import React, { useEffect, useState } from "react";

export type QuestionProgressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion: number;
  totalQuestions: number;
  completedQuestions: number[];
  onSelectQuestion: (num: number) => void;
};

export function QuestionProgressModal({
  isOpen,
  onClose,
  currentQuestion,
  totalQuestions,
  completedQuestions,
  onSelectQuestion,
}: QuestionProgressModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let raf: number;
    if (isOpen) {
      raf = requestAnimationFrame(() => {
        setIsRendered(true);
        setIsVisible(true);
      });
    } else {
      raf = requestAnimationFrame(() => {
        setIsVisible(false);
      });
      timer = setTimeout(() => {
        setIsRendered(false);
      }, 240);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 220);
  };

  if (!isRendered) return null;

  const completedCount = completedQuestions.length;
  const percentage = Math.round((completedCount / totalQuestions) * 100);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.70)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "12px",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onClick={handleClose}
    >
      <div
        className="boxy-card-lg"
        style={{
          width: "100%",
          maxWidth: "400px",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "var(--color-surface)",
          border: "2px solid var(--color-border)",
          boxShadow: "var(--shadow-boxy-lg)",
          padding: "18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.92)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.30s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.24s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1.5px solid var(--color-border)",
            paddingBottom: "10px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              className="font-mono"
              style={{
                fontSize: "10px",
                fontWeight: 800,
                color: "var(--color-accent)",
                letterSpacing: "0.08em",
              }}
            >
              NAVIGASI SOAL
            </span>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 800,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Status Pengerjaan
            </h3>
          </div>

          <button
            onClick={handleClose}
            type="button"
            className="font-mono boxy-pressable-sm"
            style={{
              width: "32px",
              height: "32px",
              border: "1.5px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              boxShadow: "var(--shadow-boxy-xs)",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress Metric Bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            backgroundColor: "var(--color-surface-dim)",
            border: "1.5px solid var(--color-border)",
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              className="font-mono"
              style={{ fontSize: "11px", fontWeight: 700 }}
            >
              PROGRES: {completedCount}/{totalQuestions} SELESAI
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "var(--color-accent)",
              }}
            >
              {percentage}%
            </span>
          </div>

          <div
            style={{
              height: "8px",
              width: "100%",
              backgroundColor: "var(--color-surface)",
              border: "1.5px solid var(--color-border)",
              display: "flex",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: isVisible ? `${percentage}%` : "0%",
                backgroundColor: "var(--color-accent)",
                transition: "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        </div>

        {/* Question Grid (Staggered Pop-in Tiles) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--color-text-muted)",
            }}
          >
            KETUK NOMOR UNTUK MELOMPAT:
          </span>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
            }}
          >
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num, idx) => {
              const isCurrent = num === currentQuestion;
              const isCompleted = completedQuestions.includes(num);

              let bg = "var(--color-surface)";
              let borderColor = "var(--color-border)";
              let shadow = "none";
              const textColor = "var(--color-text)";

              if (isCurrent) {
                borderColor = "var(--color-accent)";
                shadow = "var(--shadow-boxy-accent)";
              } else if (isCompleted) {
                bg = "var(--color-surface-dim)";
              }

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    onSelectQuestion(num);
                    handleClose();
                  }}
                  className={`boxy-pressable-sm ${isCompleted && !isCurrent ? "dither-overlay" : ""}`}
                  style={{
                    height: "46px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: bg,
                    color: textColor,
                    border: isCurrent ? "2px solid var(--color-accent)" : `1.5px solid ${borderColor}`,
                    boxShadow: shadow,
                    cursor: "pointer",
                    position: "relative",
                    // Staggered ripple entrance for each tile
                    animation: isVisible
                      ? `tilePopIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 24}ms both`
                      : "none",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: isCurrent ? "var(--color-accent)" : "inherit",
                    }}
                  >
                    {String(num).padStart(2, "0")}
                  </span>

                  {isCurrent && (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "7.5px",
                        fontWeight: 900,
                        color: "var(--color-accent)",
                        marginTop: "-2px",
                      }}
                    >
                      AKTIF
                    </span>
                  )}

                  {isCompleted && !isCurrent && (
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "3px",
                        fontSize: "9px",
                        fontWeight: 900,
                        color: "var(--color-accent)",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend / Keterangan Warna */}
        <div
          style={{
            borderTop: "1.5px dashed var(--color-border)",
            paddingTop: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--color-text-muted)",
            }}
          >
            KETERANGAN STATUS:
          </span>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              fontSize: "11.5px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid var(--color-accent)",
                  boxShadow: "1.5px 1.5px 0px 0px var(--color-accent)",
                  flexShrink: 0,
                }}
              />
              <span>
                <strong style={{ color: "var(--color-accent)" }}>Merah</strong> : Soal aktif saat ini
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                className="dither-overlay"
                style={{
                  width: "14px",
                  height: "14px",
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: "var(--color-surface-dim)",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "8px",
                    fontWeight: 900,
                    color: "var(--color-accent)",
                  }}
                >
                  ✓
                </span>
              </div>
              <span>
                <strong>Dither (✓)</strong> : Sudah dijawab lengkap (Tier 1–3)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  flexShrink: 0,
                }}
              />
              <span>
                <strong>Polos</strong> : Belum dikerjakan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
