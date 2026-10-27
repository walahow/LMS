"use client";

import React, { useState } from "react";
import { QuestionProgressModal } from "./QuestionProgressModal";

export type BoxyProgressBarProps = {
  currentQuestion: number;
  totalQuestions: number;
  completedQuestions: number[];
  onSelectQuestion: (num: number) => void;
};

export function BoxyProgressBar({
  currentQuestion,
  totalQuestions,
  completedQuestions,
  onSelectQuestion,
}: BoxyProgressBarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    setModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="font-mono boxy-pressable-sm"
        style={{
          height: "36px",
          padding: "0 10px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          boxShadow: "var(--shadow-boxy-xs)", // 2px shadow
          color: "var(--color-text)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 800,
          flexShrink: 0,
        }}
        title="Klik untuk melihat status semua soal"
      >
        <span style={{ color: "var(--color-accent)" }}>
          {String(currentQuestion).padStart(2, "0")}
        </span>
        <span style={{ opacity: 0.35 }}>|</span>
        <span>{String(totalQuestions).padStart(2, "0")}</span>

        <span
          style={{
            fontSize: "9px",
            border: "1px solid var(--color-border)",
            padding: "1px 3px",
            backgroundColor: "var(--color-surface-dim)",
            marginLeft: "2px",
          }}
        >
          ▾
        </span>
      </button>

      <QuestionProgressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        completedQuestions={completedQuestions}
        onSelectQuestion={onSelectQuestion}
      />
    </>
  );
}
