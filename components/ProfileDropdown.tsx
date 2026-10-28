"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";

export type ProfileDropdownProps = {
  fullName: string;
  initials: string;
  email?: string;
  grade?: string;
  profileHref?: string;
};

export function ProfileDropdown({
  fullName,
  initials,
  email,
  grade,
  profileHref = "/profile",
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Avatar Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="font-mono boxy-pressable-sm"
        style={{
          height: "36px",
          width: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isOpen ? "var(--color-surface-dim)" : "var(--color-surface)",
          color: "var(--color-text)",
          border: isOpen ? "1.5px solid var(--color-accent)" : "1.5px solid var(--color-border)",
          boxShadow: isOpen ? "var(--shadow-boxy-accent)" : "none",
          fontSize: "12px",
          fontWeight: 900,
          cursor: "pointer",
          position: "relative",
          zIndex: 60,
        }}
        title={`Menu Akun: ${fullName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {initials}
      </button>

      {/* Neo-Brutalist Dropdown Popover */}
      {isOpen && (
        <div
          className="boxy-card-flat"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: "230px",
            backgroundColor: "var(--color-surface)",
            border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-boxy)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "tilePopIn 0.16s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
          role="menu"
        >
          {/* Top User Info Section */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "var(--color-surface-dim)",
              borderBottom: "1.5px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: "3px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
              <span
                style={{
                  fontSize: "13.5px",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fullName}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  padding: "1px 5px",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  flexShrink: 0,
                }}
              >
                {grade || "SISWA"}
              </span>
            </div>

            {email && (
              <span
                className="font-mono"
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {email}
              </span>
            )}
          </div>

          {/* Menu Items List */}
          <div style={{ padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {/* 1. Go to Profile */}
            <Link
              href={profileHref}
              onClick={() => setIsOpen(false)}
              className="font-mono boxy-pressable-sm"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                fontSize: "11.5px",
                fontWeight: 800,
                color: "var(--color-text)",
                textDecoration: "none",
                backgroundColor: "var(--color-surface)",
                border: "1px solid transparent",
              }}
              role="menuitem"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                <span>PROFIL & KEAMANAN</span>
              </div>
              <span style={{ color: "var(--color-text-muted)" }}>➔</span>
            </Link>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                backgroundColor: "var(--color-border)",
                opacity: 0.25,
                margin: "2px 0",
              }}
            />

            {/* 2. Direct Logout */}
            <form action={signOut} style={{ width: "100%" }}>
              <button
                type="submit"
                className="font-mono boxy-pressable-sm"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  fontSize: "11.5px",
                  fontWeight: 800,
                  color: "var(--color-accent)",
                  backgroundColor: "transparent",
                  border: "1px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                role="menuitem"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>KELUAR DARI AKUN</span>
                </div>
                <span>➔</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
