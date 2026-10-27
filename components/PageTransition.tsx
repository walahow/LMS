"use client";

import React, { useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [animating, setAnimating] = useState(true);

  return (
    <div
      className={animating ? "page-transition" : undefined}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && e.animationName === "pageEnter") {
          setAnimating(false);
        }
      }}
      style={{
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
