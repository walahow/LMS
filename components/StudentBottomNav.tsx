import React from "react";
import Link from "next/link";

type Tab = "dashboard" | "history" | "profile";

export function StudentBottomNav({ activeTab }: { activeTab: Tab }) {
  const tabs = [
    {
      id: "dashboard" as Tab,
      label: "Beranda",
      href: "/dashboard",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      ),
    },
    {
      id: "history" as Tab,
      label: "Riwayat",
      href: "/history",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
    },
    {
      id: "profile" as Tab,
      label: "Profil",
      href: "/profile",
      icon: (
        <svg
          width="18"
          height="18"
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
      ),
    },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 45,
        width: "100%",
        maxWidth: "440px",
        backgroundColor: "var(--color-bg)",
        borderTop: "1.5px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px calc(8px + env(safe-area-inset-bottom, 0px))",
        marginTop: "auto",
      }}
      aria-label="Navigasi Utama Siswa"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`font-mono ${isActive ? "boxy-pressable-sm" : ""}`}
            style={{
              flex: 1,
              maxWidth: "130px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "7px 4px",
              textDecoration: "none",
              color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
              backgroundColor: isActive ? "var(--color-surface)" : "transparent",
              border: isActive ? "1.5px solid var(--color-border)" : "1.5px solid transparent",
              boxShadow: isActive ? "var(--shadow-boxy-accent)" : "none",
              fontSize: "11px",
              fontWeight: isActive ? 800 : 600,
              letterSpacing: "0.02em",
              transition: "transform 0.08s ease, box-shadow 0.08s ease, color 0.15s ease",
              position: "relative",
            }}
          >
            {/* Top red accent pip for active tab */}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  top: "-1.5px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "16px",
                  height: "2.5px",
                  backgroundColor: "var(--color-accent)",
                }}
              />
            )}
            <div
              style={{
                color: isActive ? "var(--color-accent)" : "currentColor",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tab.icon}
            </div>
            <span>{tab.label.toUpperCase()}</span>
          </Link>
        );
      })}
    </nav>
  );
}
