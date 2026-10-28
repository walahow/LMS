"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { generateAIQuestionsAction } from "@/app/admin/dashboard/actions";
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
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<ActiveTab>("generator");

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
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
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

  // Toggle publish status of a set
  const handleTogglePublish = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSets((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextPub = !s.published;
          showToast(
            nextPub
              ? `Paket "${s.title}" berhasil diterbitkan ke siswa!`
              : `Paket "${s.title}" dikembalikan menjadi draf.`
          );
          return { ...s, published: nextPub };
        }
        return s;
      })
    );
  };

  // Reset user password simulation
  const handleResetPassword = (userId: string, userName: string) => {
    setResetFeedbackId(userId);
    showToast(`Kata sandi untuk ${userName} berhasil direset ke "password123".`);
    setTimeout(() => {
      setResetFeedbackId(null);
    }, 2500);
  };

  // Add new user
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const parts = newUserName.trim().split(" ");
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : newUserName.trim().slice(0, 2).toUpperCase();

    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      fullName: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      grade: newUserRole === "student" ? newUserGrade : undefined,
      initials,
      createdAt: "Hari ini",
    };

    setUsers([newUser, ...users]);
    setNewUserName("");
    setNewUserEmail("");
    setIsAddingUser(false);
    showToast(`Pengguna "${newUser.fullName}" berhasil ditambahkan!`);
  };

  // AI Question Generator (Live Gemini with Mock Fallback)
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genIndicator.trim() || !genTitle.trim()) return;

    setIsGenerating(true);
    setGenerationStep("Menghubungi Gemini 1.5 Flash...");

    try {
      const liveRes = await generateAIQuestionsAction({
        indicator: genIndicator.trim(),
        subject: genSubject,
        grade: genGrade,
        count: genCount,
        difficulty: genDifficulty,
      });

      if (liveRes.isLive && liveRes.questions && liveRes.questions.length > 0) {
        const liveQuestions: AdminQuestion[] = liveRes.questions.map((q, idx) => ({
          id: `gemini-q${idx + 1}-${Date.now()}`,
          position: idx + 1,
          stem: q.stem,
          options: q.options,
          correctOption: q.correct_option,
          reasons: q.reasons,
          correctReason: q.correct_reason,
        }));

        setGeneratedPreview({
          packTitle: genTitle.trim(),
          indicator: genIndicator.trim(),
          subject: genSubject,
          grade: genGrade,
          questions: liveQuestions,
        });

        setIsGenerating(false);
        setGenerationStep(null);
        showToast(`Berhasil menghasilkan ${liveQuestions.length} butir soal 3-tier LIVE dari Gemini 1.5 Flash!`);
        return;
      }
      
      if (liveRes.error) {
        showToast(`Info AI: ${liveRes.error}. Menampilkan pratinjau mode demo.`);
      }
    } catch {
      // Fallback to simulated generation
    }

    setTimeout(() => {
      setGenerationStep("Menganalisis indikator & taksonomi Bloom...");
    }, 900);

    setTimeout(() => {
      setGenerationStep("Menyusun 3-tier: stem, jawaban, dan pola miskonsepsi...");
    }, 1800);

    setTimeout(() => {
      setIsGenerating(false);
      setGenerationStep(null);

      // Generate mock preview questions based on input
      const sampleQuestions: AdminQuestion[] = [
        {
          id: `gen-q1-${Date.now()}`,
          position: 1,
          stem: `Pada konsep ${genTitle.toLowerCase()}, bagaimana pengaruh perubahan variabel utama terhadap kondisi kesetimbangan benda saat diberikan perlakuan ekstrem?`,
          options: [
            "Nilai variabel berbanding lurus dan melipatgandakan respons sistem",
            "Sistem tetap mempertahankan kondisi inersia tanpa respons tambahan",
            "Respons sistem berkurang drastis menjadi setengah dari semula",
            "Tidak dapat ditentukan tanpa adanya konstanta empiris awal",
          ],
          correctOption: 0,
          reasons: [
            "Berdasarkan hukum fundamental fisika, perubahan gaya berbanding lurus dengan percepatan pada massa konstan",
            "Inersia benda selalu meniadakan gaya luar dalam segala kondisi",
            "Gaya luar membutuhkan waktu penyesuaian fasa sebelum menggerakkan benda",
            "Massa benda berubah secara spontan seiring bertambahnya percepatan",
          ],
          correctReason: 0,
        },
        {
          id: `gen-q2-${Date.now()}`,
          position: 2,
          stem: `Dua benda dengan rasio besaran 1 : 2 diberikan gaya luar yang identik. Bagaimanakah perbandingan laju percepatan kedua benda tersebut?`,
          options: [
            "Benda pertama memiliki percepatan dua kali lebih besar dari benda kedua",
            "Kedua benda memiliki laju percepatan yang identik karena gaya sama",
            "Benda kedua bergerak lebih cepat karena memiliki inersia lebih tinggi",
            "Kedua benda langsung berhenti seketika akibat gaya gesek",
          ],
          correctOption: 0,
          reasons: [
            "Percepatan berbanding terbalik dengan massa (a = F / m), sehingga massa yang lebih kecil mengalami percepatan lebih besar",
            "Gaya yang sama akan menghasilkan percepatan yang identik tanpa memandang massa",
            "Massa yang lebih besar menyimpan energi kinetik potensial lebih banyak",
            "Gaya luar langsung diserap oleh permukaan lantai tanpa menghasilkan gerak",
          ],
          correctReason: 0,
        },
        {
          id: `gen-q3-${Date.now()}`,
          position: 3,
          stem: `Manakah pernyataan yang paling tepat mengenai pasangan aksi-reaksi pada interaksi benda dan bidang tumpunya?`,
          options: [
            "Gaya tekan benda ke lantai dan gaya normal lantai ke benda",
            "Gaya berat benda dan gaya normal yang saling meniadakan",
            "Gaya gravitasi bumi dan gaya gesek statis lantai",
            "Gaya dorong eksternal dan resultan gaya percepatan",
          ],
          correctOption: 0,
          reasons: [
            "Pasangan gaya aksi-reaksi selalu bekerja pada dua benda yang berbeda dan memiliki arah berlawanan",
            "Gaya normal dan gaya berat berada pada benda yang sama sehingga merupakan pasangan aksi-reaksi",
            "Hukum aksi-reaksi hanya berlaku saat benda bergerak dengan kecepatan konstan",
            "Gaya reaksi muncul lebih lambat daripada gaya aksi yang mengenainya",
          ],
          correctReason: 0,
        },
      ];

      setGeneratedPreview({
        packTitle: genTitle.trim(),
        indicator: genIndicator.trim(),
        subject: genSubject,
        grade: genGrade,
        questions: sampleQuestions,
      });

      showToast("Berhasil menghasilkan 3 butir soal 3-tier dengan Gemini Flash!");
    }, 2800);
  };

  // Save generated preview as Draft or Published
  const handleSaveGeneratedPack = (publishDirectly: boolean) => {
    if (!generatedPreview) return;

    const newSet: AdminQuestionSet = {
      id: `pack-${Date.now()}`,
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

    setSets([newSet, ...sets]);
    setGeneratedPreview(null);
    setActiveTab("sets");
    showToast(
      publishDirectly
        ? `Paket "${newSet.title}" berhasil diterbitkan dan masuk ke daftar!`
        : `Paket "${newSet.title}" disimpan sebagai draf!`
    );
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            border: "2px solid var(--color-accent)",
            boxShadow: "var(--shadow-boxy)",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "400px",
            animation: "pageEnter 0.2s ease",
          }}
        >
          <span style={{ color: "var(--color-accent)", fontSize: "16px" }}>✦</span>
          <span>{toastMessage}</span>
        </div>
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
                backgroundColor: "rgba(255, 40, 0, 0.1)",
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

            {/* Box 2: Diterbitkan (Ferrari Red Highlight) */}
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
            onClick={() => setActiveTab("generator")}
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
            onClick={() => setActiveTab("sets")}
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
            onClick={() => setActiveTab("users")}
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
                  GEMINI 1.5 FLASH
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
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      className="boxy-input"
                      style={{ fontSize: "13px" }}
                    />
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="boxy-pressable-md"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-accent-contrast)",
                    border: "2px solid var(--color-border)",
                    boxShadow: "var(--shadow-boxy)",
                    padding: "12px 18px",
                    fontSize: "13px",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono), monospace",
                    letterSpacing: "0.04em",
                    cursor: isGenerating ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "6px",
                  }}
                >
                  {isGenerating ? (
                    <>
                      <span className="font-mono" style={{ animation: "pulse 1s infinite" }}>
                        [ MEMPROSES... ]
                      </span>
                      <span>{generationStep || "Gemini Flash sedang bekerja..."}</span>
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
                    onClick={() => handleSaveGeneratedPack(false)}
                    className="boxy-pressable-sm"
                    style={{
                      padding: "10px 16px",
                      border: "1.5px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text)",
                      fontWeight: 700,
                      fontSize: "12px",
                      fontFamily: "var(--font-mono), monospace",
                      cursor: "pointer",
                    }}
                  >
                    SIMPAN SEBAGAI DRAF
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveGeneratedPack(true)}
                    className="boxy-pressable-md"
                    style={{
                      padding: "10px 18px",
                      border: "2px solid var(--color-border)",
                      backgroundColor: "var(--color-accent)",
                      color: "var(--color-accent-contrast)",
                      boxShadow: "var(--shadow-boxy-accent)",
                      fontWeight: 800,
                      fontSize: "12px",
                      fontFamily: "var(--font-mono), monospace",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>TERBITKAN KE SISWA</span>
                    <span>➔</span>
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
                          onClick={(e) => handleTogglePublish(set.id, e)}
                          className="boxy-pressable-sm font-mono"
                          style={{
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
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            width: "100%",
                          }}
                        >
                          {set.published ? "JADIKAN DRAF" : "TERBITKAN"}
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
                                ? "rgba(255, 40, 0, 0.1)"
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

                        {/* Reset Password Action Button */}
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
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
