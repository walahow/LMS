"use client";

import React from "react";

export type ButtonLoadingBarProps = {
  /**
   * Visual variant:
   * - 'contrast': white/bright runner on dark or electric accent background
   * - 'surface': accent-colored runner on light/card surface background
   * - 'accent': electric blue/cyan runner with high-contrast track
   */
  variant?: "contrast" | "surface" | "accent";
  /** Height in pixels (default: 3.5px) */
  height?: number;
};

/**
 * Tactile Neo-Brutalist indeterminate loading bar rendered along the bottom
 * edge of an active button. Ensure the parent button has `position: relative`
 * and `overflow: hidden`.
 */
export function ButtonLoadingBar({
  variant = "contrast",
  height = 3.5,
}: ButtonLoadingBarProps) {
  const isSurface = variant === "surface";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        backgroundColor: isSurface
          ? "rgba(11, 21, 43, 0.12)"
          : "rgba(0, 0, 0, 0.32)",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        className="boxy-loading-bar-runner"
        style={{
          height: "100%",
          backgroundColor: isSurface ? "var(--color-accent)" : "#FFFFFF",
          boxShadow: isSurface
            ? "0 0 4px var(--color-accent)"
            : "0 0 6px rgba(255, 255, 255, 0.8)",
        }}
      />
    </div>
  );
}
