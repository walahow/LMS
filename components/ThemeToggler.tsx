"use client";

import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";

export function ThemeToggler() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("lms-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("lms-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = theme === "light" ? "dark" : "light";

    // MagicUI Boxy/Rectangular Reveal transition using View Transitions API + inset()
    const doc = document as unknown as {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (
      !doc.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      applyTheme(next);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const top = rect.top;
    const left = rect.left;
    const bottom = window.innerHeight - rect.bottom;
    const right = window.innerWidth - rect.right;

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        applyTheme(next);
      });
    });

    transition.ready.then(() => {
      // Box / Rectangular reveal expanding outwards from the button's exact box
      document.documentElement.animate(
        {
          clipPath: [
            `inset(${top}px ${right}px ${bottom}px ${left}px)`,
            `inset(0px 0px 0px 0px)`,
          ],
        },
        {
          duration: 250,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  if (!mounted) {
    return <div style={{ width: 36, height: 36 }} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Ganti ke mode ${isDark ? "terang" : "gelap"}`}
      aria-label="Toggle theme"
      className="boxy-pressable-sm"
      style={{
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        border: "1.5px solid var(--color-border)",
        boxShadow: "var(--shadow-boxy-xs)", // 2px shadow
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {isDark ? (
        /* Pixelated Moon */
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="currentColor"
          shapeRendering="crispEdges"
        >
          <rect x="6" y="2" width="5" height="2" />
          <rect x="4" y="4" width="3" height="2" />
          <rect x="3" y="6" width="3" height="4" />
          <rect x="4" y="10" width="3" height="2" />
          <rect x="6" y="12" width="5" height="2" />
          <rect x="9" y="4" width="2" height="2" fill="var(--color-surface)" />
          <rect x="8" y="6" width="3" height="4" fill="var(--color-surface)" />
          <rect x="9" y="10" width="2" height="2" fill="var(--color-surface)" />
        </svg>
      ) : (
        /* Pixelated Sun */
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="currentColor"
          shapeRendering="crispEdges"
        >
          <rect x="5" y="5" width="6" height="6" />
          <rect x="7" y="1" width="2" height="2" />
          <rect x="7" y="13" width="2" height="2" />
          <rect x="1" y="7" width="2" height="2" />
          <rect x="13" y="7" width="2" height="2" />
          <rect x="3" y="3" width="2" height="2" />
          <rect x="11" y="3" width="2" height="2" />
          <rect x="3" y="11" width="2" height="2" />
          <rect x="11" y="11" width="2" height="2" />
        </svg>
      )}
    </button>
  );
}
