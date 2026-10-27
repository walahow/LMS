"use client";

import React, { useEffect, useRef, useState } from "react";

export type NumberTickerProps = {
  value: number;
  direction?: "up" | "down";
  duration?: number; // milliseconds
  delay?: number; // milliseconds
  className?: string;
  style?: React.CSSProperties;
  suffix?: string;
};

// Smooth easeOutExpo curve
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function NumberTicker({
  value,
  direction = "up",
  duration = 2000,
  delay = 300,
  className = "",
  style,
  suffix = "",
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(direction === "up" ? 0 : value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let startTime: number | null = null;
    let timerId: NodeJS.Timeout;

    const startAnimation = () => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutExpo(progress);

        const current =
          direction === "up"
            ? Math.round(eased * value)
            : Math.round(value - eased * value);

        setDisplayValue(current);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };

      frameRef.current = requestAnimationFrame(step);
    };

    timerId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timerId);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, direction, duration, delay]);

  return (
    <span
      className={`font-mono ${className}`}
      style={{
        display: "inline-block",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.04em",
        ...style,
      }}
    >
      {displayValue}
      {suffix}
    </span>
  );
}
