"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { ButtonLoadingBar } from "@/components/ButtonLoadingBar";
import {
  generateAIQuestionsAction,
  createUserAction,
  resetUserPasswordAction,
  deleteUserAction,
  togglePublishSetAction,
  saveQuestionSetAction,
} from "@/app/admin/dashboard/actions";
import type { AdminProfile, AdminStats, AdminQuestionSet, AdminUser, AdminQuestion } from "@/lib/admin-data";

type AdminDashboardViewProps = {
  profile: AdminProfile;
  stats: AdminStats;
  questionSets: AdminQuestionSet[];
  users: AdminUser[];
};

type ActiveTab = "generator" | "sets" | "users";
type SetFilter = "semua" | "diterbitkan" | "draf";
type UserRoleFilter = "semua" | "siswa" | "guru" | "admin";

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export function AdminDashboardView({
  profile,
  stats: initialStats,
  questionSets: initialSets,
  users: initialUsers,
}: AdminDashboardViewProps) {
  // Navigation tabs state with direction-aware swipe animation
  const TAB_ORDER: Record<ActiveTab, number> = {
    generator: 0,
    sets: 1,
    users: 2,
  };
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [activeTab, setActiveTab] = useState<ActiveTab>("generator");
  const [tabDirection, setTabDirection] = useState<"forward" | "backward">("forward");

  const switchTab = (targetTab: ActiveTab) => {
    if (targetTab === activeTab) return;
    const currentIdx = TAB_ORDER[activeTab];
    const targetIdx = TAB_ORDER[targetTab];
    setTabDirection(targetIdx > currentIdx ? "forward" : "backward");
    setActiveTab(targetTab);
  };

  // Sets state
  const [sets, setSets] = useState<AdminQuestionSet[]>(initialSets);
  const [setSearch, setSetSearch] = useState("");
  const [setFilter, setSetFilter] = useState<SetFilter>("semua");
  const [previewSetId, setPreviewSetId] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("semua");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [resetFeedbackId, setResetFeedbackId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingUserId, setIsDeletingUserId] = useState<string | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"student" | "teacher" | "admin">("student");
  const [newUserGrade, setNewUserGrade] = useState("Kelas X-A");
  const [newUserPassword, setNewUserPassword] = useState("password123");

  // Generator form state
  const [genIndicator, setGenIndicator] = useState(
    "Menganalisis hubungan antara gaya, massa, dan percepatan pada gerak lurus benda serta penerapannya dalam kehidupan sehari-hari."
  );
  const [genTitle, setGenTitle] = useState("Hukum Newton & Dinamika Gerak");
  const [genSubject, setGenSubject] = useState("Fisika");
  const [genGrade, setGenGrade] = useState("Kelas 10");
  const [genDifficulty, setGenDifficulty] = useState<"mudah" | "sedang" | "sulit">("sedang");
  const [genCount, setGenCount] = useState<number | "">(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [generatedPreview, setGeneratedPreview] = useState<{
    packTitle: string;
    indicator: string;
    subject: string;
    grade: string;
    questions: AdminQuestion[];
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stats derived dynamically
  const publishedSetsCount = sets.filter((s) => s.published).length;
  const draftSetsCount = sets.length - publishedSetsCount;
  const studentCount = users.filter((u) => u.role === "student").length;
  const teacherCount = users.filter((u) => u.role === "teacher").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered sets
  const filteredSets = useMemo(() => {
    return sets.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(setSearch.toLowerCase()) ||
        s.subject.toLowerCase().includes(setSearch.toLowerCase()) ||
        s.indicator.toLowerCase().includes(setSearch.toLowerCase());
      const matchFilter =
        setFilter === "semua" ||
        (setFilter === "diterbitkan" && s.published) ||
        (setFilter === "draf" && !s.published);
      return matchSearch && matchFilter;
    });
  }, [sets, setSearch, setFilter]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchFilter =
        roleFilter === "semua" ||
        (roleFilter === "siswa" && u.role === "student") ||
        (roleFilter === "guru" && u.role === "teacher") ||
        (roleFilter === "admin" && u.role === "admin");
      return matchSearch && matchFilter;
    });
  }, [users, userSearch, roleFilter]);

  // Toggle publish status of a set with live Supabase persistence
  const [togglingSetId, setTogglingSetId] = useState<string | null>(null);

  const handleTogglePublish = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetSet = sets.find((s) => s.id === id);
    if (!targetSet) return;
    const nextPub = !targetSet.published;

    setTogglingSetId(id);
    // Optimistic UI update
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, published: nextPub } : s))
    );

    const res = await togglePublishSetAction({ setId: id, published: nextPub });
    setTogglingSetId(null);

    if (!res.success) {
      // Revert on failure
      setSets((prev) =>
        prev.map((s) => (s.id === id ? { ...s, published: !nextPub } : s))
      );
      showToast(res.error || "Gagal mengubah status publikasi.");
      return;
    }

    showToast(
      nextPub
        ? `Paket "${targetSet.title}" berhasil diterbitkan ke siswa!`
        : `Paket "${targetSet.title}" dikembalikan menjadi draf.`
    );
  };

  // Reset user password with live Supabase auth update
  const handleResetPassword = async (userId: string, userName: string) => {
    setResetFeedbackId(userId);
    const res = await resetUserPasswordAction({ userId, newPassword: "password123" });
    if (!res.success) {
      showToast(res.error || `Gagal mereset kata sandi untuk ${userName}.`);
      setResetFeedbackId(null);
      return;
    }
    showToast(`Kata sandi untuk ${userName} berhasil direset ke "password123".`);
    setTimeout(() => {
      setResetFeedbackId(null);
    }, 2500);
  };

  // Delete user (students and teachers only)
  const handleDeleteUser = async (userId: string, userName: string) => {
    setIsDeletingUserId(userId);
    const res = await deleteUserAction({ userId });
    setIsDeletingUserId(null);
    setConfirmDeleteId(null);

    if (!res.success) {
      showToast(res.error || `Gagal menghapus akun ${userName}.`);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(`Akun "${userName}" berhasil dihapus dari sistem!`);
  };

  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Add new user with live Supabase provisioning
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast("Nama lengkap dan email wajib diisi.");
      return;
    }

    setIsSubmittingUser(true);
    const res = await createUserAction({
      fullName: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      grade: newUserRole === "student" ? newUserGrade : undefined,
      password: newUserPassword || "password123",
    });
    setIsSubmittingUser(false);

    if (!res.success || !res.user) {
      showToast(res.error || "Gagal menambahkan pengguna baru.");
      return;
    }

    setUsers([res.user, ...users]);
    setNewUserName("");
    setNewUserEmail("");
    setIsAddingUser(false);
    showToast(`Pengguna "${res.user.fullName}" berhasil ditambahkan ke database!`);
  };

  // AI Question Generator (Calls real AI via Server Action, Session-Only)
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genIndicator.trim() || !genTitle.trim()) {
      const errorMsg = "Judul dan indikator pembelajaran wajib diisi.";
      setGenError(errorMsg);
      showToast(errorMsg);
      return;
    }

    const countNum = typeof genCount === "number" ? genCount : parseInt(String(genCount), 10);
    if (genCount === "" || isNaN(countNum) || countNum <= 0) {
      const errorMsg = "Jumlah soal tidak boleh kosong atau 0. Silakan isi minimal 1 butir soal.";
      setGenError(errorMsg);
      showToast(errorMsg);
      return;
    }

    setGenError(null);
    setIsGenerating(true);

    try {
      const res = await generateAIQuestionsAction({
        indicator: genIndicator.trim(),
        title: genTitle.trim(),
        subject: genSubject.trim() || "Fisika",
        grade: genGrade,
        count: countNum,
        difficulty: genDifficulty,
      });

      if (res.success && res.questions && res.questions.length > 0) {
        setGeneratedPreview({
          packTitle: genTitle.trim(),
          indicator: genIndicator.trim(),
          subject: genSubject.trim() || "Fisika",
          grade: genGrade,
          questions: res.questions,
        });
        showToast(`Berhasil menghasilkan ${res.questions.length} butir soal 3-tier!`);
      } else {
        const errorMsg = res.error || "Gagal membuat soal. Silakan coba beberapa saat lagi.";
        setGenError(errorMsg);
        showToast(errorMsg);
      }
    } catch {
      const errorMsg = "Terjadi kendala koneksi ke layanan AI. Pastikan internet Anda aktif lalu coba kembali.";
      setGenError(errorMsg);
      showToast(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const [savingAction, setSavingAction] = useState<"draft" | "publish" | null>(null);
  const isSavingSet = Boolean(savingAction);

  // Save generated preview as Draft or Published with live Supabase persistence
  const handleSaveGeneratedPack = async (publishDirectly: boolean) => {
    if (!generatedPreview) return;

    setSavingAction(publishDirectly ? "publish" : "draft");
    const res = await saveQuestionSetAction({
      title: generatedPreview.packTitle,
      indicator: generatedPreview.indicator,
      subject: generatedPreview.subject,
      grade: generatedPreview.grade,
      difficulty: genDifficulty,
      published: publishDirectly,
      questions: generatedPreview.questions,
    });
    setSavingAction(null);

    if (!res.success) {
      showToast(res.error || "Gagal menyimpan paket soal ke database.");
      return;
    }

    const savedId = res.setId || `pack-${Date.now()}`;
    const newSet: AdminQuestionSet = {
      id: savedId,
      title: generatedPreview.packTitle,
      indicator: generatedPreview.indicator,
      subject: generatedPreview.subject,
      grade: generatedPreview.grade,
      difficulty: genDifficulty,
      published: publishDirectly,
      questionCount: generatedPreview.questions.length,
      createdAt: "Hari ini",
      questions: generatedPreview.questions,
    };

    setSets((prev) => [newSet, ...prev]);
    setGeneratedPreview(null);
    setTabDirection("forward");
    setActiveTab("sets");
    showToast(
      publishDirectly
        ? `Paket "${newSet.title}" berhasil disimpan & diterbitkan ke database!`
        : `Paket "${newSet.title}" berhasil disimpan sebagai draf di database!`
    );
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Toast Notification (Rendered via Portal directly to body, guaranteed pinned to viewport bottom) */}
      {isMounted && toastMessage && createPortal(
        <div
          role="status"
          aria-live="polite"
          className="toast-bottom-screen"
          style={{
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            border: "2px solid var(--color-accent)",
            boxShadow: "0 6px 0 var(--color-border), 0 12px 28px rgba(0, 0, 0, 0.35)",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: 800,
            fontFamily: "var(--font-mono), monospace",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "calc(100% - 32px)",
            maxWidth: "460px",
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-accent-contrast)",
              padding: "3px 7px",
              fontSize: "11px",
              fontWeight: 900,
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            [ SUKSES ]
          </span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{toastMessage}</span>
        </div>,
        document.body
      )}

      {/* Pinned Sticky Header Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          backgroundColor: "var(--color-surface)",
          borderBottom: "1.5px solid var(--color-border)",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand Mark & Role */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link
              href="/admin/dashboard"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  backgroundColor: "var(--color-accent)",
                }}
              />
              <span
                className="font-mono"
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: "var(--color-text)",
                }}
              >
                LMS DIAGNOSTIK
              </span>
            </Link>
            <span
              className="badge-mono"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-accent-contrast)",
                borderColor: "var(--color-border)",
                fontSize: "10px",
                padding: "2px 6px",
              }}
            >
              ADMIN
            </span>
          </div>

          {/* Theme Toggler & Avatar Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ThemeToggler />
            <ProfileDropdown
              initials={profile.initials}
              fullName={profile.fullName}
              grade="Administrator"
              email={profile.email}
              profileHref="/admin/profile"
            />
          </div>
        </div>
      </header>

      {/* Main Command-Center Container */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          padding: "18px 16px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* 1. Unified Admin Info & Stats Card (Inspired by Student & Teacher Dashboards) */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "20px 18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            position: "relative",
          }}
        >
          {/* Top Info & Greeting */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                }}
              >
                {getTimeGreeting()},
              </span>
              <h1
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text)",
                  lineHeight: 1.25,
                }}
              >
                {profile.fullName}
              </h1>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.45,
                }}
              >
                Pusat Kendali Admin — Buat soal AI tiga tingkat, kelola paket soal, dan manajemen akun pengguna.
              </p>
            </div>

            <span
              className="badge-mono"
              style={{
                fontSize: "10.5px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                padding: "4px 8px",
                backgroundColor: "var(--color-accent-dim)",
                borderColor: "var(--color-accent)",
                color: "var(--color-accent)",
                flexShrink: 0,
              }}
            >
              ADMINISTRATOR
            </span>
          </div>

          {/* 3-Box Diagnostic Stats Row (Exact same size as Student & Teacher Dashboards) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {/* Box 1: Total Paket Soal */}
            <div
              style={{
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface-dim)",
                padding: "12px 8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "var(--color-text)",
                }}
              >
                {String(sets.length).padStart(2, "0")}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                PAKET SOAL
              </span>
            </div>

            {/* Box 2: Diterbitkan (Accent Highlight) */}
            <div
              style={{
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                boxShadow: "var(--shadow-boxy-accent)",
                padding: "12px 8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "var(--color-accent)",
                }}
              >
                {String(publishedSetsCount).padStart(2, "0")}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  letterSpacing: "0.02em",
                }}
              >
                DITERBITKAN
              </span>
            </div>

            {/* Box 3: Total Pengguna */}
            <div
              style={{
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface-dim)",
                padding: "12px 8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "var(--color-text)",
                }}
              >
                {String(users.length).padStart(2, "0")}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "9.5px",
                  fontWeight: 800,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                PENGGUNA
              </span>
            </div>
          </div>
        </section>

        {/* 2. Prominent, Bigger 3-Section Selector Navigation with Tactile Dither Overlay */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginTop: "2px",
          }}
        >
          {/* Button 1: Generator AI */}
          <button
            type="button"
            onClick={() => switchTab("generator")}
            className="boxy-pressable-md font-mono"
            style={{
              minHeight: "68px",
              padding: "12px 8px",
              border:
                activeTab === "generator"
                  ? "2px solid var(--color-accent)"
                  : "1.5px solid var(--color-border)",
              backgroundColor:
                activeTab === "generator" ? "var(--color-surface)" : "var(--color-bg)",
              boxShadow:
                activeTab === "generator" ? "var(--shadow-boxy-accent)" : "none",
              color:
                activeTab === "generator" ? "var(--color-accent)" : "var(--color-text)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Dither pattern on selected section */}
            {activeTab === "generator" && (
              <div
                className="dither-overlay-accent"
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.28,
                  pointerEvents: "none",
                }}
              />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: "16px" }}>✦</span>
              <span style={{ fontSize: "13px", fontWeight: 800 }}>BUAT SOAL</span>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: activeTab === "generator" ? "var(--color-text)" : "var(--color-text-muted)",
                position: "relative",
                zIndex: 1,
              }}
            >
              Generator AI
            </span>
          </button>

          {/* Button 2: Paket Soal (Test Cases) */}
          <button
            type="button"
            onClick={() => switchTab("sets")}
            className="boxy-pressable-md font-mono"
            style={{
              minHeight: "68px",
              padding: "12px 8px",
              border:
                activeTab === "sets"
                  ? "2px solid var(--color-accent)"
                  : "1.5px solid var(--color-border)",
              backgroundColor:
                activeTab === "sets" ? "var(--color-surface)" : "var(--color-bg)",
              boxShadow:
                activeTab === "sets" ? "var(--shadow-boxy-accent)" : "none",
              color:
                activeTab === "sets" ? "var(--color-accent)" : "var(--color-text)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Dither pattern on selected section */}
            {activeTab === "sets" && (
              <div
                className="dither-overlay-accent"
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.28,
                  pointerEvents: "none",
                }}
              />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: "16px" }}>🗂</span>
              <span style={{ fontSize: "13px", fontWeight: 800 }}>PAKET SOAL</span>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: activeTab === "sets" ? "var(--color-text)" : "var(--color-text-muted)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {sets.length} Paket Soal
            </span>
          </button>

          {/* Button 3: Pengguna (User Management) */}
          <button
            type="button"
            onClick={() => switchTab("users")}
            className="boxy-pressable-md font-mono"
            style={{
              minHeight: "68px",
              padding: "12px 8px",
              border:
                activeTab === "users"
                  ? "2px solid var(--color-accent)"
                  : "1.5px solid var(--color-border)",
              backgroundColor:
                activeTab === "users" ? "var(--color-surface)" : "var(--color-bg)",
              boxShadow:
                activeTab === "users" ? "var(--shadow-boxy-accent)" : "none",
              color:
                activeTab === "users" ? "var(--color-accent)" : "var(--color-text)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Dither pattern on selected section */}
            {activeTab === "users" && (
              <div
                className="dither-overlay-accent"
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.28,
                  pointerEvents: "none",
                }}
              />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: "16px" }}>👥</span>
              <span style={{ fontSize: "13px", fontWeight: 800 }}>PENGGUNA</span>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: activeTab === "users" ? "var(--color-text)" : "var(--color-text-muted)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {users.length} Akun
            </span>
          </button>
        </section>

        {/* Direction-Aware Segment Deck Container */}
        <div
          key={activeTab}
          className={tabDirection === "forward" ? "slide-forward" : "slide-backward"}
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
        {/* =========================================================================
            TAB 1: BUAT SOAL (AI GENERATOR)
           ========================================================================= */}
        {activeTab === "generator" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Generator Form Card */}
            <section
              className="boxy-card-flat"
              style={{
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
                  borderBottom: "1.5px solid var(--color-border)",
                  paddingBottom: "12px",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 800, margin: 0 }}>
                    BUAT PAKET SOAL 3-TIER DENGAN AI
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                    Tulis indikator capaian pembelajaran — AI akan merumuskan stem, 4 opsi jawaban, dan 4 opsi alasan.
                  </p>
                </div>
                <span
                  className="badge-mono"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-accent-contrast)",
                    fontSize: "10px",
                  }}
                >
                  AI GENERATOR
                </span>
              </div>

              <form onSubmit={handleGenerateAI} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Indikator Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label
                    htmlFor="indicator"
                    className="font-mono"
                    style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                  >
                    INDIKATOR PEMBELAJARAN (CAPAIAN) *
                  </label>
                  <textarea
                    id="indicator"
                    rows={3}
                    required
                    value={genIndicator}
                    onChange={(e) => setGenIndicator(e.target.value)}
                    className="boxy-input"
                    placeholder="Contoh: Menganalisis hubungan antara gaya, massa, dan percepatan pada gerak lurus..."
                    style={{ resize: "vertical", fontSize: "13px", lineHeight: 1.5 }}
                  />
                </div>

                {/* Judul Field */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label
                    htmlFor="title"
                    className="font-mono"
                    style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                  >
                    JUDUL PAKET SOAL *
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={genTitle}
                    onChange={(e) => setGenTitle(e.target.value)}
                    className="boxy-input"
                    placeholder="Contoh: Hukum Newton & Dinamika Gerak"
                    style={{ fontSize: "13px" }}
                  />
                </div>

                {/* Grid Inputs: Subject, Grade, Difficulty, Count */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label
                      htmlFor="subject"
                      className="font-mono"
                      style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                    >
                      MATA PELAJARAN
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={genSubject}
                      onChange={(e) => setGenSubject(e.target.value)}
                      className="boxy-input"
                      placeholder="Fisika"
                      style={{ fontSize: "13px" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label
                      htmlFor="grade"
                      className="font-mono"
                      style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                    >
                      JENJANG / KELAS
                    </label>
                    <select
                      id="grade"
                      value={genGrade}
                      onChange={(e) => setGenGrade(e.target.value)}
                      className="boxy-input"
                      style={{ fontSize: "13px" }}
                    >
                      <option value="Kelas 10">Kelas 10</option>
                      <option value="Kelas 11">Kelas 11</option>
                      <option value="Kelas 12">Kelas 12</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label
                      htmlFor="difficulty"
                      className="font-mono"
                      style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                    >
                      KESULITAN
                    </label>
                    <select
                      id="difficulty"
                      value={genDifficulty}
                      onChange={(e) => setGenDifficulty(e.target.value as "mudah" | "sedang" | "sulit")}
                      className="boxy-input"
                      style={{ fontSize: "13px" }}
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label
                      htmlFor="count"
                      className="font-mono"
                      style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                    >
                      JUMLAH SOAL
                    </label>
                    <input
                      id="count"
                      type="number"
                      min={1}
                      max={20}
                      value={genCount}
                      placeholder="Contoh: 5"
                      onKeyDown={(e) => {
                        if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setGenCount("");
                        } else {
                          const parsed = parseInt(val, 10);
                          setGenCount(isNaN(parsed) ? "" : parsed);
                        }
                      }}
                      className="boxy-input"
                      style={{
                        fontSize: "13px",
                        borderColor:
                          genCount === "" || genCount <= 0 || genCount > 20
                            ? "#E11D48"
                            : undefined,
                      }}
                    />
                    {(genCount === "" || genCount <= 0 || genCount > 20) && (
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 700,
                          color: "#E11D48",
                          marginTop: "2px",
                        }}
                      >
                        {genCount === ""
                          ? "⚠ Jumlah soal wajib diisi (min. 1 butir)."
                          : genCount <= 0
                          ? "⚠ Jumlah soal minimal 1 butir."
                          : "⚠ Maksimal 20 butir soal."}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Callout */}
                <div
                  style={{
                    padding: "10px 12px",
                    border: "1.5px solid var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    fontSize: "11.5px",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.45,
                  }}
                >
                  <span style={{ color: "var(--color-accent)", fontWeight: 800 }}>ℹ</span>
                  <span>
                    Hasil AI selalu masuk sebagai <strong>DRAF</strong>. Anda dapat memeriksa, menyunting opsi atau alasan, dan menerbitkan ke siswa kapan saja.
                  </span>
                </div>

                {/* Error Feedback for Non-Power Users */}
                {genError && (
                  <div
                    style={{
                      padding: "10px 12px",
                      border: "1.5px solid #E11D48",
                      backgroundColor: "rgba(225, 29, 72, 0.08)",
                      color: "#E11D48",
                      fontSize: "12px",
                      fontWeight: 600,
                      lineHeight: 1.45,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>⚠</span>
                    <span>{genError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isGenerating || genCount === "" || genCount <= 0 || genCount > 20}
                  className="boxy-pressable-md"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor:
                      isGenerating || genCount === "" || genCount <= 0 || genCount > 20
                        ? "var(--color-surface-dim)"
                        : "var(--color-accent)",
                    color:
                      isGenerating || genCount === "" || genCount <= 0 || genCount > 20
                        ? "var(--color-text-muted)"
                        : "var(--color-accent-contrast)",
                    border: "2px solid var(--color-border)",
                    boxShadow:
                      isGenerating || genCount === "" || genCount <= 0 || genCount > 20
                        ? "none"
                        : "var(--shadow-boxy)",
                    padding: "12px 18px",
                    fontSize: "13px",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono), monospace",
                    letterSpacing: "0.04em",
                    cursor:
                      isGenerating || genCount === "" || genCount <= 0 || genCount > 20
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "6px",
                  }}
                >
                  {isGenerating ? (
                    <>
                      <span className="font-mono" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <span>✦ MEMPROSES SOAL DENGAN AI...</span>
                      </span>
                      <ButtonLoadingBar variant="contrast" height={4} />
                    </>
                  ) : (
                    <>
                      <span>✦ BUAT SOAL DENGAN AI</span>
                      <span>➔</span>
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Generated Question Preview Deck */}
            {generatedPreview && (
              <section
                className="boxy-card-active"
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  borderColor: "var(--color-accent)",
                  boxShadow: "var(--shadow-boxy-accent)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                    borderBottom: "1.5px solid var(--color-border)",
                    paddingBottom: "10px",
                  }}
                >
                  <div>
                    <span
                      className="font-mono"
                      style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: 800 }}
                    >
                      PRATINJAU HASIL GENERASI AI
                    </span>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "2px 0 0" }}>
                      {generatedPreview.packTitle}
                    </h3>
                  </div>
                  <span
                    className="badge-mono"
                    style={{
                      borderColor: "var(--color-accent)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {generatedPreview.questions.length} SOAL DIBUAT
                  </span>
                </div>

                {/* Preview Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {generatedPreview.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      style={{
                        padding: "14px",
                        border: "1.5px solid var(--color-border)",
                        backgroundColor: "var(--color-surface)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Stem */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <span
                          className="badge-mono"
                          style={{
                            backgroundColor: "var(--color-text)",
                            color: "var(--color-surface)",
                            flexShrink: 0,
                          }}
                        >
                          SOAL {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, lineHeight: 1.45 }}>
                          {q.stem}
                        </p>
                      </div>

                      {/* Tier 1: Options */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span
                          className="font-mono"
                          style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-text-muted)" }}
                        >
                          PILIHAN JAWABAN (TIER 1)
                        </span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}>
                          {q.options.map((opt, optIdx) => {
                            const isKey = optIdx === q.correctOption;
                            return (
                              <div
                                key={optIdx}
                                style={{
                                  padding: "6px 10px",
                                  border: isKey
                                    ? "1.5px solid #16A34A"
                                    : "1px solid var(--color-border)",
                                  backgroundColor: isKey
                                    ? "rgba(22, 163, 74, 0.08)"
                                    : "var(--color-bg)",
                                  fontSize: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "8px",
                                }}
                              >
                                <span>
                                  <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                                </span>
                                {isKey && (
                                  <span
                                    className="font-mono"
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 800,
                                      color: "#16A34A",
                                      flexShrink: 0,
                                    }}
                                  >
                                    ✓ KUNCI
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tier 2: Reasons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span
                          className="font-mono"
                          style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-text-muted)" }}
                        >
                          PILIHAN ALASAN (TIER 2)
                        </span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}>
                          {q.reasons.map((rsn, rsnIdx) => {
                            const isKey = rsnIdx === q.correctReason;
                            return (
                              <div
                                key={rsnIdx}
                                style={{
                                  padding: "6px 10px",
                                  border: isKey
                                    ? "1.5px solid #16A34A"
                                    : "1px solid var(--color-border)",
                                  backgroundColor: isKey
                                    ? "rgba(22, 163, 74, 0.08)"
                                    : "var(--color-bg)",
                                  fontSize: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "8px",
                                }}
                              >
                                <span>
                                  <strong>{String.fromCharCode(65 + rsnIdx)}.</strong> {rsn}
                                </span>
                                {isKey && (
                                  <span
                                    className="font-mono"
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 800,
                                      color: "#16A34A",
                                      flexShrink: 0,
                                    }}
                                  >
                                    ✓ KUNCI
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tier 1 & 2 Concept Explanation */}
                      {q.explanation && (
                        <div
                          style={{
                            padding: "8px 10px",
                            backgroundColor: "var(--color-surface-dim)",
                            border: "1.5px dashed var(--color-border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                          }}
                        >
                          <span
                            className="font-mono"
                            style={{
                              fontSize: "10px",
                              fontWeight: 800,
                              color: "var(--color-accent)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            💡 PENJELASAN KONSEP & ALASAN BENAR
                          </span>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              lineHeight: 1.45,
                              color: "var(--color-text)",
                            }}
                          >
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions: Save Draft or Publish */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "10px",
                    flexWrap: "wrap",
                    borderTop: "1.5px solid var(--color-border)",
                    paddingTop: "12px",
                  }}
                >
                  <button
                    type="button"
                    disabled={isSavingSet}
                    onClick={() => handleSaveGeneratedPack(false)}
                    className="boxy-pressable-sm"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      padding: "10px 16px",
                      border: "1.5px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      fontWeight: 700,
                      fontSize: "12px",
                      fontFamily: "var(--font-mono), monospace",
                      cursor: isSavingSet ? "not-allowed" : "pointer",
                      opacity: isSavingSet && savingAction !== "draft" ? 0.6 : 1,
                    }}
                  >
                    <span>
                      {savingAction === "draft"
                        ? "MENYIMPAN DRAF..."
                        : "SIMPAN SEBAGAI DRAF"}
                    </span>
                    {savingAction === "draft" && (
                      <ButtonLoadingBar variant="surface" height={3.5} />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSavingSet}
                    onClick={() => handleSaveGeneratedPack(true)}
                    className="boxy-pressable-md"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      padding: "10px 18px",
                      border: "2px solid var(--color-border)",
                      backgroundColor: "var(--color-accent)",
                      color: "var(--color-accent-contrast)",
                      boxShadow: isSavingSet ? "none" : "var(--shadow-boxy-accent)",
                      fontWeight: 800,
                      fontSize: "12px",
                      fontFamily: "var(--font-mono), monospace",
                      cursor: isSavingSet ? "not-allowed" : "pointer",
                      opacity: isSavingSet && savingAction !== "publish" ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>
                      {savingAction === "publish"
                        ? "MENERBITKAN KE SISWA..."
                        : "TERBITKAN KE SISWA"}
                    </span>
                    {savingAction !== "publish" && <span>➔</span>}
                    {savingAction === "publish" && (
                      <ButtonLoadingBar variant="contrast" height={3.5} />
                    )}
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: KELOLA PAKET SOAL (TEST CASES)
           ========================================================================= */}
        {activeTab === "sets" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Search & Filter Bar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <input
                type="text"
                value={setSearch}
                onChange={(e) => setSetSearch(e.target.value)}
                placeholder="Cari judul, mata pelajaran, atau indikator..."
                className="boxy-input"
                style={{ fontSize: "13px" }}
              />

              {/* Status Filter Pills */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(
                  [
                    { id: "semua", label: `SEMUA (${sets.length})` },
                    { id: "diterbitkan", label: `DITERBITKAN (${publishedSetsCount})` },
                    { id: "draf", label: `DRAF (${draftSetsCount})` },
                  ] as const
                ).map((pill) => {
                  const isActive = setFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setSetFilter(pill.id)}
                      className="boxy-pressable-sm font-mono"
                      style={{
                        padding: "6px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: isActive
                          ? "2px solid var(--color-accent)"
                          : "1.5px solid var(--color-border)",
                        backgroundColor: isActive
                          ? "var(--color-accent)"
                          : "var(--color-surface)",
                        color: isActive
                          ? "var(--color-accent-contrast)"
                          : "var(--color-text)",
                        cursor: "pointer",
                      }}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of Question Sets */}
            {filteredSets.length === 0 ? (
              <div
                className="boxy-card-flat"
                style={{
                  padding: "32px 20px",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: "13px",
                }}
              >
                Tidak ada paket soal yang cocok dengan pencarian & filter.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredSets.map((set) => {
                  const isPreviewOpen = previewSetId === set.id;

                  return (
                    <article
                      key={set.id}
                      className="boxy-card-flat"
                      style={{
                        padding: "16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div className="dither-fade-right" aria-hidden="true" />
                      {/* Top Badges */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span
                            className="badge-mono"
                            style={{
                              backgroundColor: "var(--color-text)",
                              color: "var(--color-surface)",
                              fontSize: "10px",
                            }}
                          >
                            • {set.subject.toUpperCase()}
                          </span>
                          <span className="badge-mono" style={{ fontSize: "10px" }}>
                            {set.grade}
                          </span>
                          <span className="badge-mono" style={{ fontSize: "10px" }}>
                            {set.questionCount} SOAL
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span
                          className="badge-mono"
                          style={{
                            fontSize: "10px",
                            border: "1.5px solid",
                            borderColor: set.published ? "#16A34A" : "var(--color-border)",
                            backgroundColor: set.published
                              ? "rgba(22, 163, 74, 0.12)"
                              : "var(--color-bg)",
                            color: set.published ? "#16A34A" : "var(--color-text-muted)",
                          }}
                        >
                          {set.published ? "✓ DITERBITKAN" : "✎ DRAF"}
                        </span>
                      </div>

                      {/* Title & Indicator */}
                      <div>
                        <h3
                          style={{
                            fontSize: "15px",
                            fontWeight: 800,
                            margin: "0 0 4px",
                            color: "var(--color-text)",
                          }}
                        >
                          {set.title}
                        </h3>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--color-text-muted)",
                            lineHeight: 1.45,
                            margin: 0,
                          }}
                        >
                          {set.indicator}
                        </p>
                      </div>

                      {/* Card Action Buttons: 3 equal-width columns that fit any screen */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "6px",
                          borderTop: "1px dashed var(--color-border)",
                          paddingTop: "10px",
                          width: "100%",
                        }}
                      >
                        {/* 1. Toggle Preview */}
                        <button
                          type="button"
                          onClick={() => setPreviewSetId(isPreviewOpen ? null : set.id)}
                          className="boxy-pressable-sm font-mono"
                          style={{
                            padding: "7px 4px",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            border: "1.5px solid var(--color-border)",
                            backgroundColor: isPreviewOpen
                              ? "var(--color-bg)"
                              : "var(--color-surface)",
                            color: "var(--color-text)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            width: "100%",
                          }}
                        >
                          {isPreviewOpen ? "TUTUP ▴" : "INTIP SOAL ▾"}
                        </button>

                        {/* 2. Publish/Draft Toggle Action */}
                        <button
                          type="button"
                          disabled={togglingSetId === set.id}
                          onClick={(e) => handleTogglePublish(set.id, e)}
                          className="boxy-pressable-sm font-mono"
                          style={{
                            position: "relative",
                            overflow: "hidden",
                            padding: "7px 4px",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            border: "1.5px solid var(--color-border)",
                            backgroundColor: set.published
                              ? "var(--color-surface)"
                              : "var(--color-accent)",
                            color: set.published
                              ? "var(--color-text)"
                              : "var(--color-accent-contrast)",
                            cursor: togglingSetId === set.id ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            width: "100%",
                          }}
                        >
                          {togglingSetId === set.id ? (
                            <>
                              <span>{set.published ? "MENARIK..." : "MENERBITKAN..."}</span>
                              <ButtonLoadingBar
                                variant={set.published ? "surface" : "contrast"}
                                height={3}
                              />
                            </>
                          ) : set.published ? (
                            "JADIKAN DRAF"
                          ) : (
                            "TERBITKAN"
                          )}
                        </button>

                        {/* 3. Direct Link to Editor */}
                        <Link
                          href={`/admin/sets/${set.id}`}
                          className="boxy-pressable-sm font-mono"
                          style={{
                            textDecoration: "none",
                            padding: "7px 4px",
                            fontSize: "10.5px",
                            fontWeight: 800,
                            border: "1.5px solid var(--color-border)",
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-text)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            gap: "4px",
                            whiteSpace: "nowrap",
                            width: "100%",
                          }}
                        >
                          <span>SUNTING</span>
                          <span>➔</span>
                        </Link>
                      </div>

                      {/* Expandable Preview Section */}
                      {isPreviewOpen && set.questions && (
                        <div
                          style={{
                            marginTop: "8px",
                            paddingTop: "10px",
                            borderTop: "1.5px solid var(--color-border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {set.questions.map((q, qIdx) => (
                            <div
                              key={q.id}
                              style={{
                                padding: "10px 12px",
                                border: "1px solid var(--color-border)",
                                backgroundColor: "var(--color-bg)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                              }}
                            >
                              <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                                <span
                                  className="badge-mono"
                                  style={{
                                    fontSize: "9.5px",
                                    padding: "2px 5px",
                                    flexShrink: 0,
                                  }}
                                >
                                  Q{qIdx + 1}
                                </span>
                                <span style={{ fontSize: "12px", fontWeight: 600 }}>{q.stem}</span>
                              </div>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "var(--color-text-muted)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "2px",
                                }}
                              >
                                <span>
                                  <strong>Kunci Jawaban:</strong> {String.fromCharCode(65 + q.correctOption)}. {q.options[q.correctOption]}
                                </span>
                                <span>
                                  <strong>Kunci Alasan:</strong> {String.fromCharCode(65 + q.correctReason)}. {q.reasons[q.correctReason]}
                                </span>
                                {q.explanation && (
                                  <span style={{ marginTop: "3px", color: "var(--color-text)" }}>
                                    <strong style={{ color: "var(--color-accent)" }}>💡 Konsep:</strong>{" "}
                                    {q.explanation}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: MANAJEMEN PENGGUNA (USERS)
           ========================================================================= */}
        {activeTab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Header Action: Add User Toggle & Search */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Cari nama atau email pengguna..."
                  className="boxy-input"
                  style={{ fontSize: "13px", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="boxy-pressable-sm font-mono"
                  style={{
                    padding: "8px 14px",
                    border: "2px solid var(--color-border)",
                    backgroundColor: isAddingUser
                      ? "var(--color-bg)"
                      : "var(--color-accent)",
                    color: isAddingUser
                      ? "var(--color-text)"
                      : "var(--color-accent-contrast)",
                    fontWeight: 800,
                    fontSize: "11px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isAddingUser ? "BATAL ✕" : "+ TAMBAH PENGGUNA"}
                </button>
              </div>

              {/* Role Filter Pills */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(
                  [
                    { id: "semua", label: `SEMUA (${users.length})` },
                    { id: "siswa", label: `SISWA (${studentCount})` },
                    { id: "guru", label: `GURU (${teacherCount})` },
                    { id: "admin", label: `ADMIN (${adminCount})` },
                  ] as const
                ).map((pill) => {
                  const isActive = roleFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setRoleFilter(pill.id)}
                      className="boxy-pressable-sm font-mono"
                      style={{
                        padding: "6px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: isActive
                          ? "2px solid var(--color-accent)"
                          : "1.5px solid var(--color-border)",
                        backgroundColor: isActive
                          ? "var(--color-accent)"
                          : "var(--color-surface)",
                        color: isActive
                          ? "var(--color-accent-contrast)"
                          : "var(--color-text)",
                        cursor: "pointer",
                      }}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expandable Add User Form */}
            {isAddingUser && (
              <section
                className="boxy-card-active"
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  borderColor: "var(--color-accent)",
                  boxShadow: "var(--shadow-boxy-accent)",
                }}
              >
                <div style={{ borderBottom: "1.5px solid var(--color-border)", paddingBottom: "8px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>
                    TAMBAH PENGGUNA BARU
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                    Daftarkan akun siswa, guru, atau admin dengan kata sandi awal default.
                  </p>
                </div>

                <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="font-mono" style={{ fontSize: "10.5px", fontWeight: 700 }}>
                        NAMA LENGKAP *
                      </label>
                      <input
                        type="text"
                        required
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Contoh: Ahmad Fauzi"
                        className="boxy-input"
                        style={{ fontSize: "12.5px" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="font-mono" style={{ fontSize: "10.5px", fontWeight: 700 }}>
                        ALAMAT EMAIL *
                      </label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="ahmad@lms.local"
                        className="boxy-input"
                        style={{ fontSize: "12.5px" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="font-mono" style={{ fontSize: "10.5px", fontWeight: 700 }}>
                        PERAN AKUN
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as "student" | "teacher" | "admin")}
                        className="boxy-input"
                        style={{ fontSize: "12.5px" }}
                      >
                        <option value="student">Siswa</option>
                        <option value="teacher">Guru</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    {newUserRole === "student" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label className="font-mono" style={{ fontSize: "10.5px", fontWeight: 700 }}>
                          KELAS / KELOMPOK
                        </label>
                        <input
                          type="text"
                          value={newUserGrade}
                          onChange={(e) => setNewUserGrade(e.target.value)}
                          placeholder="Kelas X-A"
                          className="boxy-input"
                          style={{ fontSize: "12.5px" }}
                        />
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label className="font-mono" style={{ fontSize: "10.5px", fontWeight: 700 }}>
                        KATA SANDI AWAL
                      </label>
                      <input
                        type="text"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="boxy-input"
                        style={{ fontSize: "12.5px" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="boxy-pressable-md"
                    style={{
                      backgroundColor: "var(--color-accent)",
                      color: "var(--color-accent-contrast)",
                      border: "2px solid var(--color-border)",
                      padding: "10px 16px",
                      fontSize: "12px",
                      fontWeight: 800,
                      fontFamily: "var(--font-mono), monospace",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginTop: "4px",
                    }}
                  >
                    <span>SIMPAN PENGGUNA BARU</span>
                    <span>➔</span>
                  </button>
                </form>
              </section>
            )}

            {/* User List */}
            {filteredUsers.length === 0 ? (
              <div
                className="boxy-card-flat"
                style={{
                  padding: "32px 20px",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: "13px",
                }}
              >
                Tidak ada pengguna yang cocok dengan pencarian & filter.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredUsers.map((user) => {
                  const isResetSuccess = resetFeedbackId === user.id;

                  return (
                    <article
                      key={user.id}
                      className="boxy-card-flat"
                      style={{
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Top: Avatar & User Info */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <div
                          className="font-mono"
                          style={{
                            width: "38px",
                            height: "38px",
                            border: "1.5px solid var(--color-border)",
                            backgroundColor:
                              user.role === "admin"
                                ? "var(--color-accent)"
                                : "var(--color-surface)",
                            color:
                              user.role === "admin"
                                ? "var(--color-accent-contrast)"
                                : "var(--color-text)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: "13px",
                            flexShrink: 0,
                          }}
                        >
                          {user.initials}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13.5px", fontWeight: 700, wordBreak: "break-word" }}>
                              {user.fullName}
                            </span>
                            {user.grade && (
                              <span
                                className="badge-mono"
                                style={{
                                  fontSize: "9px",
                                  padding: "1px 4px",
                                  borderColor: "var(--color-border)",
                                }}
                              >
                                {user.grade}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "11.5px",
                              color: "var(--color-text-muted)",
                              wordBreak: "break-all",
                              fontFamily: "var(--font-mono), monospace",
                            }}
                          >
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Role Label on Left, Reset Password on Right */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          borderTop: "1px dashed var(--color-border)",
                          paddingTop: "8px",
                          gap: "8px",
                        }}
                      >
                        <span
                          className="badge-mono"
                          style={{
                            fontSize: "10px",
                            borderColor:
                              user.role === "admin"
                                ? "var(--color-accent)"
                                : "var(--color-border)",
                            backgroundColor:
                              user.role === "admin"
                                ? "var(--color-accent-dim)"
                                : "var(--color-bg)",
                            color:
                              user.role === "admin"
                                ? "var(--color-accent)"
                                : "var(--color-text)",
                          }}
                        >
                          {user.role === "admin"
                            ? "ADMIN"
                            : user.role === "teacher"
                            ? "GURU"
                            : "SISWA"}
                        </span>

                        {/* Actions for student & teacher (admin cannot be reset or deleted) */}
                        {user.role !== "admin" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {confirmDeleteId === user.id ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span className="font-mono" style={{ fontSize: "10px", fontWeight: 700, color: "#DC2626" }}>
                                  HAPUS?
                                </span>
                                <button
                                  type="button"
                                  disabled={isDeletingUserId === user.id}
                                  onClick={() => handleDeleteUser(user.id, user.fullName)}
                                  className="boxy-pressable-sm font-mono"
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    border: "1.5px solid #DC2626",
                                    backgroundColor: "#DC2626",
                                    color: "#FFFFFF",
                                    cursor: isDeletingUserId === user.id ? "wait" : "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {isDeletingUserId === user.id ? "MENGHAPUS..." : "YA, HAPUS"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isDeletingUserId === user.id}
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="boxy-pressable-sm font-mono"
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    border: "1.5px solid var(--color-border)",
                                    backgroundColor: "var(--color-surface)",
                                    color: "var(--color-text)",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  BATAL
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleResetPassword(user.id, user.fullName)}
                                  className="boxy-pressable-sm font-mono"
                                  style={{
                                    padding: "5px 10px",
                                    fontSize: "10.5px",
                                    fontWeight: 700,
                                    border: isResetSuccess
                                      ? "1.5px solid #16A34A"
                                      : "1.5px solid var(--color-border)",
                                    backgroundColor: isResetSuccess
                                      ? "rgba(22, 163, 74, 0.15)"
                                      : "var(--color-surface)",
                                    color: isResetSuccess ? "#16A34A" : "var(--color-text)",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {isResetSuccess ? "✓ DIRESET" : "RESET KATA SANDI ↺"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(user.id)}
                                  className="boxy-pressable-sm font-mono"
                                  title={`Hapus akun ${user.fullName}`}
                                  style={{
                                    padding: "5px 8px",
                                    fontSize: "10.5px",
                                    fontWeight: 700,
                                    border: "1.5px solid rgba(220, 38, 38, 0.4)",
                                    backgroundColor: "var(--color-surface)",
                                    color: "#DC2626",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  HAPUS ✕
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
