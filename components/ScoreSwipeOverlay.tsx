"use client";

import React, { useEffect, useState } from "react";
import { NumberTicker } from "./NumberTicker";

export type DiagnosisCounts = {
  paham: number;
  miskonsepsi: number;
  luckyGuess: number;
  tidakPaham: number;
};

export type ScoreSwipeOverlayProps = {
  isOpen: boolean;
  score: number; // 0 to 100
  diagnosisCounts: DiagnosisCounts;
  totalQuestions: number;
  onClose: () => void;
  onReview?: () => void;
};

export function ScoreSwipeOverlay({
  isOpen,
  score,
  diagnosisCounts,
  totalQuestions,
  onClose,
  onReview,
}: ScoreSwipeOverlayProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [swipedIn, setSwipedIn] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    let swipeTimer: NodeJS.Timeout;
    let contentTimer: NodeJS.Timeout;
    let exitTimer: NodeJS.Timeout;
    let raf: number;

    if (isOpen) {
      raf = requestAnimationFrame(() => {
        setIsRendered(true);
      });

      // Trigger swipe-up animation on next tick
      swipeTimer = setTimeout(() => {
        setSwipedIn(true);
      }, 20);

      // Trigger content fade-in & scale after swipe reaches top
      contentTimer = setTimeout(() => {
        setContentVisible(true);
      }, 360);
    } else {
      raf = requestAnimationFrame(() => {
        setContentVisible(false);
        setSwipedIn(false);
      });
      exitTimer = setTimeout(() => {
        setIsRendered(false);
      }, 320);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(swipeTimer);
      clearTimeout(contentTimer);
      clearTimeout(exitTimer);
    };
  }, [isOpen]);

  const handleClose = () => {
    setContentVisible(false);
    setSwipedIn(false);
    setTimeout(onClose, 280);
  };

  const handleReview = () => {
    setContentVisible(false);
    setSwipedIn(false);
    setTimeout(() => {
      if (onReview) onReview();
    }, 280);
  };

  if (!isRendered) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "var(--color-bg)",
        backgroundImage: "radial-gradient(var(--color-shadow-dim) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        transform: swipedIn ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.40s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.4)",
        borderTop: "5px solid var(--color-accent)",
      }}
    >
      {/* Decorative Dither Background Bar */}
      <div
        className="dither-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          opacity: 0.35,
        }}
      />

      {/* Main Center Card */}
      <div
        className="boxy-card-lg"
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "var(--color-surface)",
          border: "2.5px solid var(--color-border)",
          boxShadow: "var(--shadow-boxy-lg)",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "22px",
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "scale(1) translateY(0)" : "scale(0.92) translateY(24px)",
          transition: "opacity 0.45s ease-out, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
        }}
      >
        {/* Top Header Pill */}
        <div
          className="badge-mono font-mono"
          style={{
            backgroundColor: "var(--color-border)",
            color: "var(--color-surface)",
            padding: "5px 12px",
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.08em",
          }}
        >
          HASIL DIAGNOSTIK SELESAI
        </div>

        {/* Ticker Display */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            margin: "8px 0",
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "var(--color-text-muted)",
              letterSpacing: "0.05em",
            }}
          >
            SKOR PEMAHAMAN KONSEP
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "4px",
              color: "var(--color-accent)",
            }}
          >
            <NumberTicker
              value={score}
              duration={2200}
              delay={550}
              style={{
                fontSize: "76px",
                lineHeight: 1,
                fontWeight: 900,
                color: "var(--color-accent)",
                textShadow: "3px 3px 0px var(--color-shadow)",
              }}
            />
            <span
              className="font-mono"
              style={{
                fontSize: "36px",
                fontWeight: 900,
                color: "var(--color-accent)",
                textShadow: "2px 2px 0px var(--color-shadow)",
              }}
            >
              %
            </span>
          </div>

          <span
            className="font-mono"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--color-text-muted)",
              marginTop: "4px",
            }}
          >
            BERDASARKAN TES 3-TIER (JAWABAN + ALASAN + KEYAKINAN)
          </span>
        </div>

        {/* Diagnostic Breakdown Matrix */}
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            borderTop: "2px dashed var(--color-border)",
            paddingTop: "18px",
          }}
        >
          {/* Paham Konsep */}
          <div
            style={{
              padding: "12px",
              border: "1.5px solid var(--color-border)",
              backgroundColor: "var(--color-surface-dim)",
              boxShadow: "2px 2px 0px 0px var(--color-shadow)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--color-accent)",
              }}
            >
              PAHAM KONSEP
            </span>
            <span
              className="font-mono"
              style={{ fontSize: "20px", fontWeight: 900 }}
            >
              {diagnosisCounts.paham} / {totalQuestions}
            </span>
          </div>

          {/* Miskonsepsi */}
          <div
            style={{
              padding: "12px",
              border: "1.5px solid var(--color-accent)",
              backgroundColor: "var(--color-surface)",
              boxShadow: "2px 2px 0px 0px var(--color-accent)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--color-accent)",
              }}
            >
              MISKONSEPSI
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: "20px",
                fontWeight: 900,
                color: "var(--color-accent)",
              }}
            >
              {diagnosisCounts.miskonsepsi} / {totalQuestions}
            </span>
          </div>

          {/* Lucky Guess */}
          <div
            style={{
              padding: "12px",
              border: "1.5px solid var(--color-border)",
              backgroundColor: "var(--color-surface-dim)",
              boxShadow: "2px 2px 0px 0px var(--color-shadow)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--color-text-muted)",
              }}
            >
              LUCKY GUESS
            </span>
            <span
              className="font-mono"
              style={{ fontSize: "20px", fontWeight: 900 }}
            >
              {diagnosisCounts.luckyGuess} / {totalQuestions}
            </span>
          </div>

          {/* Tidak Paham */}
          <div
            style={{
              padding: "12px",
              border: "1.5px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              boxShadow: "2px 2px 0px 0px var(--color-shadow)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--color-text-muted)",
              }}
            >
              TIDAK PAHAM
            </span>
            <span
              className="font-mono"
              style={{ fontSize: "20px", fontWeight: 900 }}
            >
              {diagnosisCounts.tidakPaham} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            width: "100%",
            display: "flex",
            gap: "12px",
            marginTop: "10px",
          }}
        >
          {onReview && (
            <button
              type="button"
              onClick={handleReview}
              className="font-mono boxy-pressable-sm"
              style={{
                flex: 1,
                height: "48px",
                padding: "0 14px",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                border: "1.5px solid var(--color-border)",
                boxShadow: "var(--shadow-boxy-xs)",
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ULAS JAWABAN
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="font-mono boxy-pressable-md"
            style={{
              flex: 1,
              height: "48px",
              padding: "0 14px",
              backgroundColor: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              border: "1.5px solid var(--color-border)",
              boxShadow: "var(--shadow-boxy)",
              fontSize: "13px",
              fontWeight: 900,
              letterSpacing: "0.04em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            SELESAI & KELUAR ➔
          </button>
        </div>
      </div>
    </div>
  );
}
