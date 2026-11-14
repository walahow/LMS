"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ThemeToggler } from "@/components/ThemeToggler";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { ButtonLoadingBar } from "@/components/ButtonLoadingBar";
import {
  COGNITIVE_LEVEL_OPTIONS,
  createEmptyKisiKisiItem,
  createEmptyManualItem,
  parseBulkKisiKisiText,
  parseBulkManualText,
  parseBulkTier1Text,
  type KisiKisiInputItem,
  type ManualQuestionInputItem,
} from "@/lib/tier1-parser";
import {
  CUSTOMER_QUESTION_PACKS,
  packToKisiKisiItems,
  packToManualItems,
  type CustomerQuestionPack,
} from "@/lib/customer-packs-data";
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
type GenerateMode = "full" | "tier2_only" | "manual";
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
  const [genMode, setGenMode] = useState<GenerateMode>("full");
  const [fullInputMode, setFullInputMode] = useState<"kisi_kisi" | "single_topic">("kisi_kisi");
  const [tier1OptionCount, setTier1OptionCount] = useState<4 | 5>(4);
  const [kisiKisiItems, setKisiKisiItems] = useState<KisiKisiInputItem[]>([
    createEmptyKisiKisiItem(),
  ]);
  const [showBulkKisi, setShowBulkKisi] = useState(false);
  const [bulkKisiText, setBulkKisiText] = useState("");
  const [bulkKisiError, setBulkKisiError] = useState<string | null>(null);
  const [genIndicator, setGenIndicator] = useState("");
  const [genTitle, setGenTitle] = useState("");
  const [genSubject, setGenSubject] = useState("");
  const [genGrade, setGenGrade] = useState("Kelas 10");
  const [genCount, setGenCount] = useState<number | "">(1);
  const [tier1Items, setTier1Items] = useState<ManualQuestionInputItem[]>([createEmptyManualItem(4)]);
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [bulkPasteError, setBulkPasteError] = useState<string | null>(null);
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
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.username || "").toLowerCase().includes(userSearch.toLowerCase());
      const matchFilter =
        roleFilter === "semua" ||
        (roleFilter === "siswa" && u.role === "student") ||
        (roleFilter === "guru" && u.role === "teacher") ||
        (roleFilter === "admin" && u.role === "admin");
      return matchSearch && matchFilter;
    });
  }, [users, userSearch, roleFilter]);

  // Toggle publish status of a set with live Supabase persistence
  const [togglingAction, setTogglingAction] = useState<{
    id: string;
    nextPublished: boolean;
  } | null>(null);

  const handleTogglePublish = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetSet = sets.find((s) => s.id === id);
    if (!targetSet) return;
    const nextPub = !targetSet.published;

    setTogglingAction({ id, nextPublished: nextPub });

    const res = await togglePublishSetAction({ setId: id, published: nextPub });
    setTogglingAction(null);

    if (!res.success) {
      showToast(res.error || "Gagal mengubah status publikasi.");
      return;
    }

    // Update state upon server success
    setSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, published: nextPub } : s))
    );

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

  const updateKisiKisiField = (
    idx: number,
    field: "indicator" | "subtopic" | "cognitive_level",
    value: string,
  ) => {
    setKisiKisiItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const addKisiKisiItem = () => {
    setKisiKisiItems((prev) => (prev.length >= 20 ? prev : [...prev, createEmptyKisiKisiItem()]));
  };

  const removeKisiKisiItem = (idx: number) => {
    setKisiKisiItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const handleLoadCustomerTemplate = (pack: CustomerQuestionPack) => {
    setGenTitle(pack.title);
    setGenSubject(pack.subject);
    setGenGrade(pack.grade);
    setGenIndicator(pack.indicator);
    setGenCount(pack.questions.length);
    setTier1OptionCount(5);
    setGenError(null);
    if (genMode === "tier2_only" || genMode === "manual") {
      setTier1Items(packToManualItems(pack));
    } else {
      setFullInputMode("kisi_kisi");
      setKisiKisiItems(packToKisiKisiItems(pack));
    }
    showToast(`Template "${pack.title}" (${pack.questions.length} item) dimuat ke editor!`);
  };

  const handleApplyBulkKisi = () => {
    const res = parseBulkKisiKisiText(bulkKisiText);
    if (res.error) {
      setBulkKisiError(res.error);
      return;
    }
    setBulkKisiError(null);
    setKisiKisiItems(res.items.slice(0, 20));
    setShowBulkKisi(false);
    showToast(`${Math.min(res.items.length, 20)} indikator soal per nomor berhasil dimuat!`);
  };

  const handleOptionCountChange = (nextCount: 4 | 5) => {
    setTier1OptionCount(nextCount);
    setTier1Items((prev) =>
      prev.map((item) => {
        const nextOpts =
          nextCount === 5
            ? item.options.length >= 5
              ? item.options.slice(0, 5)
              : [...item.options, ""]
            : item.options.slice(0, 4);
        const safeKey = item.correct_option >= nextOpts.length ? 0 : item.correct_option;
        return { ...item, options: nextOpts, correct_option: safeKey };
      }),
    );
  };

  const updateTier1Meta = (
    idx: number,
    field: "indicator" | "subtopic" | "cognitive_level",
    value: string,
  ) => {
    setTier1Items((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const updateTier1Stem = (idx: number, stem: string) => {
    setTier1Items((prev) => prev.map((it, i) => (i === idx ? { ...it, stem } : it)));
  };

  const updateTier1Option = (idx: number, optIdx: number, value: string) => {
    setTier1Items((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const nextOpts = [...it.options];
        nextOpts[optIdx] = value;
        return { ...it, options: nextOpts };
      }),
    );
  };

  const updateTier1Key = (idx: number, keyIdx: number) => {
    setTier1Items((prev) => prev.map((it, i) => (i === idx ? { ...it, correct_option: keyIdx } : it)));
  };

  const updateManualReason = (idx: number, reasonIdx: number, value: string) => {
    setTier1Items((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const nextReasons = [...it.reasons];
        nextReasons[reasonIdx] = value;
        return { ...it, reasons: nextReasons };
      }),
    );
  };

  const updateManualReasonKey = (idx: number, keyIdx: number) => {
    setTier1Items((prev) => prev.map((it, i) => (i === idx ? { ...it, correct_reason: keyIdx } : it)));
  };

  const updateManualExplanation = (idx: number, explanation: string) => {
    setTier1Items((prev) => prev.map((it, i) => (i === idx ? { ...it, explanation } : it)));
  };

  const addTier1Item = () => {
    setTier1Items((prev) =>
      prev.length >= 20 ? prev : [...prev, createEmptyManualItem(tier1OptionCount)],
    );
  };

  const removeTier1Item = (idx: number) => {
    setTier1Items((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const handleApplyBulkPaste = () => {
    if (genMode === "manual") {
      const res = parseBulkManualText(bulkPasteText);
      if (res.error) {
        setBulkPasteError(res.error);
        return;
      }
      setBulkPasteError(null);
      const sliced = res.items.slice(0, 20);
      if (sliced.some((it) => it.options.length >= 5)) {
        setTier1OptionCount(5);
      }
      setTier1Items(sliced);
      setShowBulkPaste(false);
      showToast(`${sliced.length} soal lengkap Tier 1 & Tier 2 berhasil dimuat!`);
      return;
    }

    const res = parseBulkTier1Text(bulkPasteText);
    if (res.error) {
      setBulkPasteError(res.error);
      return;
    }
    setBulkPasteError(null);
    const sliced: ManualQuestionInputItem[] = res.items.slice(0, 20).map((it) => ({
      ...it,
      reasons: ["", "", "", ""],
      correct_reason: 0,
      explanation: "",
    }));
    if (sliced.some((it) => it.options.length >= 5)) {
      setTier1OptionCount(5);
    }
    setTier1Items(sliced);
    setShowBulkPaste(false);
    showToast(`${sliced.length} soal Tier 1 berhasil dimuat! Periksa kunci jawabannya.`);
  };

  // AI Question Generator (Calls real AI via Server Action, Session-Only)
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTitle.trim()) {
      const errorMsg = "Judul paket soal wajib diisi.";
      setGenError(errorMsg);
      showToast(errorMsg);
      return;
    }

    if (genMode === "full") {
      if (fullInputMode === "kisi_kisi") {
        const emptyIdx = kisiKisiItems.findIndex((item) => !item.indicator.trim());
        if (kisiKisiItems.length === 0 || emptyIdx !== -1) {
          const errorMsg =
            emptyIdx !== -1
              ? `Indikator soal nomor ${emptyIdx + 1} belum diisi.`
              : "Tambahkan minimal 1 indikator soal.";
          setGenError(errorMsg);
          showToast(errorMsg);
          return;
        }
      } else {
        if (!genIndicator.trim()) {
          const errorMsg = "Topik / capaian pembelajaran wajib diisi.";
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
      }
    } else {
      for (let i = 0; i < tier1Items.length; i++) {
        const item = tier1Items[i];
        const maxLetter = item.options.length >= 5 ? "E" : "D";
        if (!item.stem.trim() || item.options.some((o) => !o.trim())) {
          const errorMsg = `Soal Tier 1 nomor ${i + 1} belum lengkap. Isi pertanyaan dan ke-${item.options.length} opsi jawaban (A–${maxLetter}).`;
          setGenError(errorMsg);
          showToast(errorMsg);
          return;
        }
        if (genMode === "manual" && (item.reasons.length !== 4 || item.reasons.some((r) => !r.trim()))) {
          const errorMsg = `Alasan Tier 2 nomor ${i + 1} belum lengkap. Isi ke-4 opsi alasan (A–D) dan pilih kuncinya.`;
          setGenError(errorMsg);
          showToast(errorMsg);
          return;
        }
      }
    }

    if (genMode === "manual") {
      const resolvedSetIndicator =
        genIndicator.trim() ||
        tier1Items[0]?.indicator?.trim() ||
        genTitle.trim();
      const now = Date.now();
      const manualQuestions: AdminQuestion[] = tier1Items.map((item, idx) => ({
        id: `manual-q-${now}-${idx + 1}`,
        position: idx + 1,
        stem: item.stem.trim(),
        options: item.options.map((o) => o.trim()),
        correctOption: item.correct_option,
        reasons: item.reasons.map((r) => r.trim()),
        correctReason: item.correct_reason,
        explanation: item.explanation?.trim() || "",
        ...(item.indicator?.trim() ? { indicator: item.indicator.trim() } : {}),
        ...(item.subtopic?.trim() ? { subtopic: item.subtopic.trim() } : {}),
        ...(item.cognitive_level?.trim() ? { cognitiveLevel: item.cognitive_level.trim() } : {}),
      }));

      setGenError(null);
      setGeneratedPreview({
        packTitle: genTitle.trim(),
        indicator: resolvedSetIndicator,
        subject: genSubject.trim() || "Umum",
        grade: genGrade,
        questions: manualQuestions,
      });
      showToast(`Pratinjau ${manualQuestions.length} butir soal lengkap siap disimpan!`);
      return;
    }

    const effectiveCount =
      genMode === "tier2_only"
        ? tier1Items.length
        : fullInputMode === "kisi_kisi"
          ? kisiKisiItems.length
          : typeof genCount === "number"
            ? genCount
            : parseInt(String(genCount), 10);

    setGenError(null);
    setIsGenerating(true);

    try {
      const resolvedSetIndicator =
        genIndicator.trim() ||
        (fullInputMode === "kisi_kisi" ? kisiKisiItems[0]?.indicator?.trim() : "") ||
        genTitle.trim();

      const res = await generateAIQuestionsAction({
        mode: genMode,
        indicator: resolvedSetIndicator,
        title: genTitle.trim(),
        subject: genSubject.trim() || "Umum",
        grade: genGrade,
        count: effectiveCount,
        tier1OptionCount,
        kisiKisiItems:
          genMode === "full" && fullInputMode === "kisi_kisi" ? kisiKisiItems : undefined,
        tier1Questions:
          genMode === "tier2_only"
            ? tier1Items.map((it) => ({
                indicator: it.indicator,
                subtopic: it.subtopic,
                cognitive_level: it.cognitive_level,
                stem: it.stem,
                options: it.options,
                correct_option: it.correct_option,
              }))
            : undefined,
      });

      if (res.success && res.questions && res.questions.length > 0) {
        setGeneratedPreview({
          packTitle: genTitle.trim(),
          indicator: resolvedSetIndicator,
          subject: genSubject.trim() || "Umum",
          grade: genGrade,
          questions: res.questions,
        });
        showToast(
          genMode === "tier2_only"
            ? `Berhasil melengkapi alasan Tier 2 untuk ${res.questions.length} soal!`
            : `Berhasil menghasilkan ${res.questions.length} butir soal 3-tier!`,
        );
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
      difficulty: "sedang",
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
                    Setiap nomor soal memiliki indikator pencapaian spesifik, opsi jawaban Tier 1 (A–D/E), dan 4 alasan Tier 2.
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

              <form onSubmit={handleGenerateAI} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Secluded Customer Kisi-Kisi Template Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                    padding: "8px 12px",
                    border: "1px dashed var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)" }}
                  >
                    TEMPLATE KISI-KISI:
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {CUSTOMER_QUESTION_PACKS.map((pack) => (
                      <button
                        key={pack.key}
                        type="button"
                        onClick={() => handleLoadCustomerTemplate(pack)}
                        className="boxy-pressable-sm font-mono"
                        style={{
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          border: "1.5px solid var(--color-border)",
                          backgroundColor: "var(--color-surface)",
                          color: "var(--color-text)",
                          cursor: "pointer",
                        }}
                      >
                        {pack.title} ({pack.questions.length})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Selector (Emphasized Primary Choice) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span
                    className="font-mono"
                    style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                  >
                    PILIH CARA PEMBUATAN SOAL
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setGenMode("full");
                        setGenError(null);
                      }}
                      className="boxy-pressable-sm"
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        border:
                          genMode === "full"
                            ? "2px solid var(--color-accent)"
                            : "1.5px solid var(--color-border)",
                        backgroundColor:
                          genMode === "full" ? "var(--color-accent-dim)" : "var(--color-surface)",
                        boxShadow:
                          genMode === "full" ? "var(--shadow-boxy-accent)" : "none",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 900,
                          color: genMode === "full" ? "var(--color-accent)" : "var(--color-text)",
                        }}
                      >
                        ✦ DARI INDIKATOR SAJA
                      </span>
                      <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                        AI membuat pertanyaan &amp; opsi Tier 1 serta alasan Tier 2 sekaligus.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGenMode("tier2_only");
                        setGenError(null);
                      }}
                      className="boxy-pressable-sm"
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        border:
                          genMode === "tier2_only"
                            ? "2px solid var(--color-accent)"
                            : "1.5px solid var(--color-border)",
                        backgroundColor:
                          genMode === "tier2_only" ? "var(--color-accent-dim)" : "var(--color-surface)",
                        boxShadow:
                          genMode === "tier2_only" ? "var(--shadow-boxy-accent)" : "none",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 900,
                          color:
                            genMode === "tier2_only" ? "var(--color-accent)" : "var(--color-text)",
                        }}
                      >
                        📝 SUDAH PUNYA TIER 1
                      </span>
                      <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                        Anda isi soal &amp; opsi jawaban; AI hanya melengkapi alasan Tier 2.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGenMode("manual");
                        setGenError(null);
                      }}
                      className="boxy-pressable-sm"
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        border:
                          genMode === "manual"
                            ? "2px solid var(--color-accent)"
                            : "1.5px solid var(--color-border)",
                        backgroundColor:
                          genMode === "manual" ? "var(--color-accent-dim)" : "var(--color-surface)",
                        boxShadow:
                          genMode === "manual" ? "var(--shadow-boxy-accent)" : "none",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 900,
                          color:
                            genMode === "manual" ? "var(--color-accent)" : "var(--color-text)",
                        }}
                      >
                        ✍ INPUT TIER 1 &amp; TIER 2
                      </span>
                      <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                        Anda isi sendiri soal Tier 1, 4 alasan Tier 2, dan kunci — tanpa AI.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Mode Full: Sub-toggle between Per-Number Kisi-Kisi vs 1 General Topic */}
                {genMode === "full" ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      padding: "14px",
                      border: "1.5px solid var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => setFullInputMode("kisi_kisi")}
                          className="font-mono"
                          style={{
                            padding: "6px 10px",
                            fontSize: "11px",
                            fontWeight: 800,
                            border:
                              fullInputMode === "kisi_kisi"
                                ? "2px solid var(--color-accent)"
                                : "1.5px solid var(--color-border)",
                            backgroundColor:
                              fullInputMode === "kisi_kisi"
                                ? "var(--color-accent-dim)"
                                : "var(--color-surface)",
                            color:
                              fullInputMode === "kisi_kisi"
                                ? "var(--color-accent)"
                                : "var(--color-text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          📋 KISI-KISI PER NOMOR SOAL ({kisiKisiItems.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFullInputMode("single_topic")}
                          className="font-mono"
                          style={{
                            padding: "6px 10px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border:
                              fullInputMode === "single_topic"
                                ? "2px solid var(--color-accent)"
                                : "1.5px solid var(--color-border)",
                            backgroundColor:
                              fullInputMode === "single_topic"
                                ? "var(--color-accent-dim)"
                                : "var(--color-surface)",
                            color:
                              fullInputMode === "single_topic"
                                ? "var(--color-accent)"
                                : "var(--color-text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          ✨ 1 TOPIK UMUM (AI PECAH OTOMATIS)
                        </button>
                      </div>

                      {fullInputMode === "kisi_kisi" && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowBulkKisi((v) => !v);
                            setBulkKisiError(null);
                          }}
                          className="font-mono"
                          style={{
                            padding: "5px 9px",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            border: "1px dashed var(--color-border)",
                            backgroundColor: showBulkKisi ? "var(--color-surface-dim)" : "transparent",
                            color: "var(--color-text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          {showBulkKisi ? "✕ Tutup Tempel Kisi-Kisi" : "📋 Tempel Daftar Kisi-Kisi"}
                        </button>
                      )}
                    </div>

                    {fullInputMode === "kisi_kisi" ? (
                      <>
                        {showBulkKisi && (
                          <div
                            style={{
                              padding: "12px",
                              border: "1.5px dashed var(--color-accent)",
                              backgroundColor: "var(--color-surface)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <span
                              className="font-mono"
                              style={{ fontSize: "10.5px", fontWeight: 800, color: "var(--color-accent)" }}
                            >
                              TEMPEL DAFTAR INDIKATOR DARI WORD / EXCEL
                            </span>
                            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.4 }}>
                              Satu baris per nomor soal. Boleh langsung tempel kolom tabel Word/Excel{" "}
                              <code>Indikator | Submateri | Level</code> atau daftar bernomor biasa.
                            </p>
                            <textarea
                              rows={5}
                              value={bulkKisiText}
                              onChange={(e) => setBulkKisiText(e.target.value)}
                              className="boxy-input"
                              placeholder={
                                "1. Menganalisis hubungan gaya dan percepatan | Hukum II Newton | C4\n2. Mengidentifikasi pasangan gaya aksi-reaksi | Hukum III Newton | C3"
                              }
                              style={{ fontSize: "12px", lineHeight: 1.45, resize: "vertical" }}
                            />
                            {bulkKisiError && (
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#E11D48" }}>
                                ⚠ {bulkKisiError}
                              </span>
                            )}
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={handleApplyBulkKisi}
                                className="boxy-pressable-sm font-mono"
                                style={{
                                  padding: "7px 12px",
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  border: "1.5px solid var(--color-border)",
                                  backgroundColor: "var(--color-accent)",
                                  color: "var(--color-accent-contrast)",
                                  cursor: "pointer",
                                }}
                              >
                                TERAPKAN KE KISI-KISI ➔
                              </button>
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {kisiKisiItems.map((kisi, idx) => (
                            <div
                              key={idx}
                              className="boxy-card-flat"
                              style={{
                                padding: "10px 12px",
                                backgroundColor: "var(--color-surface)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "8px",
                                }}
                              >
                                <span
                                  className="badge-mono font-mono"
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 900,
                                    backgroundColor: "var(--color-text)",
                                    color: "var(--color-bg)",
                                  }}
                                >
                                  NO. {String(idx + 1).padStart(2, "0")}
                                </span>
                                {kisiKisiItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeKisiKisiItem(idx)}
                                    className="font-mono"
                                    style={{
                                      padding: "2px 7px",
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      border: "1px solid var(--color-border)",
                                      backgroundColor: "transparent",
                                      color: "var(--color-text-muted)",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Hapus
                                  </button>
                                )}
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label
                                  htmlFor={`kisi-indicator-${idx}`}
                                  className="font-mono"
                                  style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--color-text)" }}
                                >
                                  INDIKATOR SOAL *
                                </label>
                                <textarea
                                  id={`kisi-indicator-${idx}`}
                                  rows={2}
                                  value={kisi.indicator}
                                  onChange={(e) => updateKisiKisiField(idx, "indicator", e.target.value)}
                                  className="boxy-input"
                                  placeholder={`Contoh: Disajikan kasus/grafik, siswa mampu menganalisis...`}
                                  style={{ fontSize: "12.5px", lineHeight: 1.4, resize: "vertical" }}
                                />
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "8px", alignItems: "end" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <label
                                    htmlFor={`kisi-subtopic-${idx}`}
                                    className="font-mono"
                                    style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)" }}
                                  >
                                    SUBMATERI (OPSIONAL)
                                  </label>
                                  <input
                                    id={`kisi-subtopic-${idx}`}
                                    type="text"
                                    value={kisi.subtopic || ""}
                                    onChange={(e) => updateKisiKisiField(idx, "subtopic", e.target.value)}
                                    className="boxy-input"
                                    placeholder="Misal: Hukum II Newton"
                                    style={{ fontSize: "11.5px", padding: "6px 8px" }}
                                  />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <label
                                    htmlFor={`kisi-cognitive-${idx}`}
                                    className="font-mono"
                                    style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)" }}
                                  >
                                    LEVEL KOGNITIF
                                  </label>
                                  <select
                                    id={`kisi-cognitive-${idx}`}
                                    value={kisi.cognitive_level || ""}
                                    onChange={(e) => updateKisiKisiField(idx, "cognitive_level", e.target.value)}
                                    className="boxy-input"
                                    aria-label={`Level kognitif soal nomor ${idx + 1}`}
                                    style={{ fontSize: "11.5px", padding: "6px 8px" }}
                                  >
                                    {COGNITIVE_LEVEL_OPTIONS.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                    {kisi.cognitive_level &&
                                      !COGNITIVE_LEVEL_OPTIONS.some((o) => o.value === kisi.cognitive_level) && (
                                        <option value={kisi.cognitive_level}>{kisi.cognitive_level}</option>
                                      )}
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {kisiKisiItems.length < 20 && (
                          <button
                            type="button"
                            onClick={addKisiKisiItem}
                            className="boxy-pressable-sm font-mono"
                            style={{
                              padding: "8px 12px",
                              fontSize: "11px",
                              fontWeight: 800,
                              border: "1.5px dashed var(--color-border)",
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text)",
                              cursor: "pointer",
                              width: "100%",
                            }}
                          >
                            + TAMBAH INDIKATOR NOMOR {kisiKisiItems.length + 1}
                          </button>
                        )}
                      </>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label
                          htmlFor="indicator"
                          className="font-mono"
                          style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                        >
                          TOPIK / CAPAIAN PEMBELAJARAN UMUM *
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
                        <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                          AI akan otomatis memecah topik ini menjadi indikator soal spesifik untuk tiap nomor.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label
                      htmlFor="indicator"
                      className="font-mono"
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      KONTEKS / TOPIK MATERI PAKET (OPSIONAL)
                    </label>
                    <textarea
                      id="indicator"
                      rows={2}
                      value={genIndicator}
                      onChange={(e) => setGenIndicator(e.target.value)}
                      className="boxy-input"
                      placeholder="Opsional: tulis topik umum paket agar alasan miskonsepsi lebih akurat..."
                      style={{ resize: "vertical", fontSize: "13px", lineHeight: 1.5 }}
                    />
                  </div>
                )}

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

                {/* Grid Inputs: Subject, Grade, Option Count, Count */}
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
                      placeholder="Contoh: Fisika"
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
                      htmlFor="option-count"
                      className="font-mono"
                      style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text)" }}
                    >
                      OPSI JAWABAN
                    </label>
                    <select
                      id="option-count"
                      value={tier1OptionCount}
                      onChange={(e) => handleOptionCountChange(Number(e.target.value) === 5 ? 5 : 4)}
                      className="boxy-input"
                      style={{ fontSize: "13px" }}
                    >
                      <option value={4}>4 Opsi (A–D)</option>
                      <option value={5}>5 Opsi (A–E)</option>
                    </select>
                  </div>

                  {genMode === "full" && fullInputMode === "single_topic" ? (
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
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span
                        className="font-mono"
                        style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)" }}
                      >
                        JUMLAH SOAL
                      </span>
                      <div
                        className="boxy-input font-mono"
                        style={{
                          fontSize: "12.5px",
                          fontWeight: 800,
                          backgroundColor: "var(--color-surface-dim)",
                          color: "var(--color-accent)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        OTOMATIS:{" "}
                        {genMode === "tier2_only" || genMode === "manual"
                          ? tier1Items.length
                          : kisiKisiItems.length}{" "}
                        SOAL
                      </div>
                    </div>
                  )}
                </div>

                {/* Tier-1 / Manual Builder (Shown when tier2_only or manual mode is active) */}
                {(genMode === "tier2_only" || genMode === "manual") && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      padding: "14px",
                      border: "1.5px solid var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span
                          className="font-mono"
                          style={{ fontSize: "12px", fontWeight: 900, color: "var(--color-text)" }}
                        >
                          {genMode === "manual"
                            ? `DAFTAR SOAL LENGKAP TIER 1 & TIER 2 (${tier1Items.length} BUTIR)`
                            : `DAFTAR SOAL TIER 1 ANDA (${tier1Items.length} BUTIR)`}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)" }}>
                          {genMode === "manual"
                            ? `Isi pertanyaan, ${tier1OptionCount} opsi Tier 1 (A–${tier1OptionCount === 5 ? "E" : "D"}), 4 alasan Tier 2 (A–D), kunci masing-masing, serta pembahasan opsional.`
                            : `Isi pertanyaan, ${tier1OptionCount} pilihan jawaban (A–${tier1OptionCount === 5 ? "E" : "D"}), dan pilih 1 kunci jawaban. Indikator per soal bersifat opsional.`}
                        </span>
                      </div>

                      {/* Secluded collapsible quick-paste helper */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowBulkPaste((v) => !v);
                          setBulkPasteError(null);
                        }}
                        className="font-mono"
                        style={{
                          padding: "5px 9px",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          border: "1px dashed var(--color-border)",
                          backgroundColor: showBulkPaste ? "var(--color-surface-dim)" : "transparent",
                          color: "var(--color-text-muted)",
                          cursor: "pointer",
                        }}
                      >
                        {showBulkPaste ? "✕ Tutup Tempel Cepat" : "📋 Tempel Banyak Soal Sekaligus"}
                      </button>
                    </div>

                    {showBulkPaste && (
                      <div
                        style={{
                          padding: "12px",
                          border: "1.5px dashed var(--color-accent)",
                          backgroundColor: "var(--color-surface)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <span
                          className="font-mono"
                          style={{ fontSize: "10.5px", fontWeight: 800, color: "var(--color-accent)" }}
                        >
                          {genMode === "manual"
                            ? "TEMPEL SOAL TIER 1 & TIER 2 DARI WORD / DOKUMEN"
                            : "TEMPEL SOAL DARI WORD / DOKUMEN"}
                        </span>
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.4 }}>
                          {genMode === "manual" ? (
                            <>
                              Format tiap soal dipisah baris kosong: awali nomor soal, opsional{" "}
                              <code>Indikator: ...</code>, opsi Tier 1 (<code>A–D/E</code>) &amp;{" "}
                              <code>Kunci Tier 1: B</code>, lalu <code>Tier 2 (Alasan)</code> atau <code>Alasan:</code>{" "}
                              diikuti opsi <code>A–D</code>, <code>Kunci Tier 2: A</code>, dan opsional{" "}
                              <code>Pembahasan: ...</code>.
                            </>
                          ) : (
                            <>
                              Format tiap soal dipisah baris kosong: awali nomor soal, opsional{" "}
                              <code>Indikator: ...</code>, lalu opsi <code>A.</code> s/d <code>D.</code>/<code>E.</code>, dan{" "}
                              <code>Kunci: B</code> (atau tanda <code>*</code> di opsi benar).
                            </>
                          )}
                        </p>
                        <textarea
                          rows={6}
                          value={bulkPasteText}
                          onChange={(e) => setBulkPasteText(e.target.value)}
                          className="boxy-input"
                          placeholder={
                            genMode === "manual"
                              ? "1. Satuan SI untuk gaya adalah...\nA. Joule\nB. Newton\nC. Watt\nD. Pascal\nKunci Tier 1: B\nAlasan:\nA. Gaya dirumuskan m × a dalam satuan kg·m/s² (Newton)\nB. Joule adalah satuan energi\nC. Watt adalah satuan daya\nD. Pascal adalah satuan tekanan\nKunci Tier 2: A\nPembahasan: Menurut Hukum II Newton F = m·a bersatuan Newton."
                              : "1. Satuan SI untuk gaya adalah...\nA. Joule\nB. Newton\nC. Watt\nD. Pascal\nKunci: B"
                          }
                          style={{ fontSize: "12px", lineHeight: 1.45, resize: "vertical" }}
                        />
                        {bulkPasteError && (
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#E11D48" }}>
                            ⚠ {bulkPasteError}
                          </span>
                        )}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={handleApplyBulkPaste}
                            className="boxy-pressable-sm font-mono"
                            style={{
                              padding: "7px 12px",
                              fontSize: "11px",
                              fontWeight: 800,
                              border: "1.5px solid var(--color-border)",
                              backgroundColor: "var(--color-accent)",
                              color: "var(--color-accent-contrast)",
                              cursor: "pointer",
                            }}
                          >
                            TERAPKAN KE DAFTAR SOAL ➔
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Question Editor Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {tier1Items.map((item, idx) => (
                        <div
                          key={idx}
                          className="boxy-card-flat"
                          style={{
                            padding: "12px",
                            backgroundColor: "var(--color-surface)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                            }}
                          >
                            <span
                              className="badge-mono font-mono"
                              style={{
                                fontSize: "10.5px",
                                fontWeight: 900,
                                backgroundColor: "var(--color-text)",
                                color: "var(--color-bg)",
                              }}
                            >
                              SOAL #{idx + 1}
                            </span>

                            {/* Secluded subtle delete button */}
                            {tier1Items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTier1Item(idx)}
                                className="font-mono"
                                style={{
                                  padding: "3px 7px",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  border: "1px solid var(--color-border)",
                                  backgroundColor: "transparent",
                                  color: "var(--color-text-muted)",
                                  cursor: "pointer",
                                }}
                              >
                                Hapus
                              </button>
                            )}
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label
                              htmlFor={`tier1-stem-${idx}`}
                              className="font-mono"
                              style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--color-text)" }}
                            >
                              PERTANYAAN SOAL #{idx + 1} *
                            </label>
                            <textarea
                              id={`tier1-stem-${idx}`}
                              rows={2}
                              value={item.stem}
                              onChange={(e) => updateTier1Stem(idx, e.target.value)}
                              className="boxy-input"
                              placeholder={`Tulis pertanyaan soal nomor ${idx + 1}...`}
                              style={{ fontSize: "12.5px", lineHeight: 1.45, resize: "vertical" }}
                            />
                          </div>

                          {/* Secluded optional per-question kisi-kisi metadata */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 185px", gap: "6px", alignItems: "end" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label
                                htmlFor={`tier1-indicator-${idx}`}
                                className="font-mono"
                                style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)" }}
                              >
                                INDIKATOR SOAL (OPSIONAL)
                              </label>
                                <input
                                  id={`tier1-indicator-${idx}`}
                                  type="text"
                                  value={item.indicator || ""}
                                  onChange={(e) => updateTier1Meta(idx, "indicator", e.target.value)}
                                  className="boxy-input"
                                  placeholder={
                                    genMode === "manual"
                                      ? "Opsional: indikator butir soal ini"
                                      : "Kosongkan agar dirumuskan AI"
                                  }
                                  style={{ fontSize: "11.5px", padding: "6px 8px" }}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label
                                htmlFor={`tier1-subtopic-${idx}`}
                                className="font-mono"
                                style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)" }}
                              >
                                SUBMATERI
                              </label>
                              <input
                                id={`tier1-subtopic-${idx}`}
                                type="text"
                                value={item.subtopic || ""}
                                onChange={(e) => updateTier1Meta(idx, "subtopic", e.target.value)}
                                className="boxy-input"
                                placeholder="Opsional"
                                style={{ fontSize: "11.5px", padding: "6px 8px" }}
                              />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label
                                htmlFor={`tier1-cognitive-${idx}`}
                                className="font-mono"
                                style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)" }}
                              >
                                LEVEL KOGNITIF
                              </label>
                              <select
                                id={`tier1-cognitive-${idx}`}
                                value={item.cognitive_level || ""}
                                onChange={(e) => updateTier1Meta(idx, "cognitive_level", e.target.value)}
                                className="boxy-input"
                                aria-label={`Level kognitif soal Tier 1 nomor ${idx + 1}`}
                                style={{ fontSize: "11.5px", padding: "6px 8px" }}
                              >
                                {COGNITIVE_LEVEL_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                                {item.cognitive_level &&
                                  !COGNITIVE_LEVEL_OPTIONS.some((o) => o.value === item.cognitive_level) && (
                                    <option value={item.cognitive_level}>{item.cognitive_level}</option>
                                  )}
                              </select>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: "8px",
                            }}
                          >
                            {item.options.map((optVal, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isKey = item.correct_option === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => updateTier1Key(idx, optIdx)}
                                    title={`Jadikan ${letter} kunci jawaban benar`}
                                    className="font-mono"
                                    style={{
                                      minWidth: "34px",
                                      height: "36px",
                                      fontSize: "11px",
                                      fontWeight: 900,
                                      border: isKey
                                        ? "2px solid #0EA47A"
                                        : "1.5px solid var(--color-border)",
                                      backgroundColor: isKey
                                        ? "rgba(14, 164, 122, 0.14)"
                                        : "var(--color-surface-dim)",
                                      color: isKey ? "#0B6B50" : "var(--color-text-muted)",
                                      cursor: "pointer",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {isKey ? `✓${letter}` : letter}
                                  </button>
                                  <input
                                    type="text"
                                    value={optVal}
                                    onChange={(e) => updateTier1Option(idx, optIdx, e.target.value)}
                                    aria-label={`Teks opsi ${letter} soal nomor ${idx + 1}`}
                                    placeholder={`Opsi ${letter}`}
                                    className="boxy-input"
                                    style={{ fontSize: "12px", padding: "7px 9px" }}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <span
                            className="font-mono"
                            style={{ fontSize: "10px", color: "var(--color-text-muted)" }}
                          >
                            Kunci jawaban terpilih:{" "}
                            <strong style={{ color: "#0B6B50" }}>
                              Opsi {String.fromCharCode(65 + item.correct_option)}
                            </strong>{" "}
                            (klik huruf di kiri opsi untuk mengganti kunci)
                          </span>

                          {/* Tier 2 Reason Builder (Shown only in Manual Mode) */}
                          {genMode === "manual" && (
                            <div
                              style={{
                                marginTop: "6px",
                                paddingTop: "10px",
                                borderTop: "1.5px dashed var(--color-border)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                                <span
                                  className="font-mono"
                                  style={{ fontSize: "10.5px", fontWeight: 800, color: "var(--color-accent)" }}
                                >
                                  ALASAN TIER 2 (4 OPSI A–D) &amp; KUNCI ALASAN *
                                </span>
                                <span
                                  className="font-mono"
                                  style={{ fontSize: "10px", color: "var(--color-text-muted)" }}
                                >
                                  Kunci alasan:{" "}
                                  <strong style={{ color: "#0B6B50" }}>
                                    Opsi {String.fromCharCode(65 + item.correct_reason)}
                                  </strong>
                                </span>
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {item.reasons.map((reasonVal, reasonIdx) => {
                                  const rLetter = String.fromCharCode(65 + reasonIdx);
                                  const isRKey = item.correct_reason === reasonIdx;
                                  return (
                                    <div
                                      key={reasonIdx}
                                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => updateManualReasonKey(idx, reasonIdx)}
                                        title={`Jadikan ${rLetter} kunci alasan benar`}
                                        className="font-mono"
                                        style={{
                                          minWidth: "34px",
                                          height: "36px",
                                          fontSize: "11px",
                                          fontWeight: 900,
                                          border: isRKey
                                            ? "2px solid #0EA47A"
                                            : "1.5px solid var(--color-border)",
                                          backgroundColor: isRKey
                                            ? "rgba(14, 164, 122, 0.14)"
                                            : "var(--color-surface-dim)",
                                          color: isRKey ? "#0B6B50" : "var(--color-text-muted)",
                                          cursor: "pointer",
                                          flexShrink: 0,
                                        }}
                                      >
                                        {isRKey ? `✓${rLetter}` : rLetter}
                                      </button>
                                      <input
                                        type="text"
                                        value={reasonVal}
                                        onChange={(e) => updateManualReason(idx, reasonIdx, e.target.value)}
                                        aria-label={`Teks alasan ${rLetter} soal nomor ${idx + 1}`}
                                        placeholder={`Alasan ilmiah ${rLetter}...`}
                                        className="boxy-input"
                                        style={{ fontSize: "12px", padding: "7px 9px" }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label
                                  htmlFor={`manual-expl-${idx}`}
                                  className="font-mono"
                                  style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)" }}
                                >
                                  PEMBAHASAN (OPSIONAL)
                                </label>
                                <textarea
                                  id={`manual-expl-${idx}`}
                                  rows={2}
                                  value={item.explanation || ""}
                                  onChange={(e) => updateManualExplanation(idx, e.target.value)}
                                  className="boxy-input"
                                  placeholder="Tulis penjelasan konsep agar tampil saat siswa mengulas jawaban..."
                                  style={{ fontSize: "12px", lineHeight: 1.4, resize: "vertical" }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {tier1Items.length < 20 && (
                      <button
                        type="button"
                        onClick={addTier1Item}
                        className="boxy-pressable-sm font-mono"
                        style={{
                          padding: "9px 12px",
                          fontSize: "11.5px",
                          fontWeight: 800,
                          border: "1.5px dashed var(--color-border)",
                          backgroundColor: "var(--color-surface)",
                          color: "var(--color-text)",
                          cursor: "pointer",
                          width: "100%",
                        }}
                      >
                        {genMode === "manual" ? "+ TAMBAH SOAL LENGKAP LAGI" : "+ TAMBAH SOAL TIER 1 LAGI"}
                      </button>
                    )}
                  </div>
                )}

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
                    {genMode === "manual"
                      ? "Paket soal yang Anda buat akan ditampilkan sebagai pratinjau dulu dan masuk sebagai DRAF atau langsung diterbitkan."
                      : "Hasil AI selalu masuk sebagai DRAF. Anda dapat memeriksa, menyunting opsi atau alasan, dan menerbitkan ke siswa kapan saja."}
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
                {(() => {
                  const isSubmitDisabled =
                    isGenerating ||
                    (genMode === "full"
                      ? genCount === "" || genCount <= 0 || genCount > 20
                      : tier1Items.length === 0);
                  return (
                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className="boxy-pressable-md"
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        backgroundColor: isSubmitDisabled
                          ? "var(--color-surface-dim)"
                          : "var(--color-accent)",
                        color: isSubmitDisabled
                          ? "var(--color-text-muted)"
                          : "var(--color-accent-contrast)",
                        border: "2px solid var(--color-border)",
                        boxShadow: isSubmitDisabled ? "none" : "var(--shadow-boxy)",
                        padding: "12px 18px",
                        fontSize: "13px",
                        fontWeight: 800,
                        fontFamily: "var(--font-mono), monospace",
                        letterSpacing: "0.04em",
                        cursor: isSubmitDisabled ? "not-allowed" : "pointer",
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
                          <span>
                            {genMode === "manual"
                              ? "✓ BUAT PRATINJAU SOAL LENGKAP"
                              : genMode === "tier2_only"
                                ? "✦ LENGKAPI ALASAN TIER 2 DENGAN AI"
                                : "✦ BUAT SOAL 3-TIER DENGAN AI"}
                          </span>
                          <span>➔</span>
                        </>
                      )}
                    </button>
                  );
                })()}
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
                      {/* Per-question indicator & metadata */}
                      {(q.indicator || q.subtopic || q.cognitiveLevel) && (
                        <div
                          style={{
                            padding: "8px 10px",
                            border: "1px dashed var(--color-border)",
                            backgroundColor: "var(--color-bg)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            {q.subtopic && (
                              <span className="badge-mono" style={{ fontSize: "9.5px" }}>
                                {q.subtopic}
                              </span>
                            )}
                            {q.cognitiveLevel && (
                              <span
                                className="badge-mono"
                                style={{
                                  fontSize: "9.5px",
                                  borderColor: "var(--color-accent)",
                                  color: "var(--color-accent)",
                                }}
                              >
                                {q.cognitiveLevel}
                              </span>
                            )}
                          </div>
                          {q.indicator && (
                            <span style={{ fontSize: "11.5px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                              <strong>Indikator:</strong> {q.indicator}
                            </span>
                          )}
                        </div>
                      )}

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
                          position: "relative",
                          zIndex: 2,
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
                            position: "relative",
                            zIndex: 2,
                            isolation: "isolate",
                            fontSize: "10px",
                            fontWeight: 800,
                            border: "1.5px solid",
                            borderColor: set.published ? "var(--color-accent)" : "var(--color-border)",
                            backgroundColor: set.published
                              ? "var(--color-surface)"
                              : "var(--color-bg)",
                            color: set.published ? "var(--color-accent)" : "var(--color-text-muted)",
                            boxShadow: set.published ? "0 1px 3px rgba(17, 106, 248, 0.18)" : "none",
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
                          disabled={togglingAction?.id === set.id}
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
                            cursor: togglingAction?.id === set.id ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            width: "100%",
                          }}
                        >
                          {togglingAction?.id === set.id ? (
                            <>
                              <span>
                                {togglingAction.nextPublished
                                  ? "MENERBITKAN..."
                                  : "MENARIK..."}
                              </span>
                              <ButtonLoadingBar
                                variant={togglingAction.nextPublished ? "contrast" : "surface"}
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

                      {!set.id.startsWith("session-") && (
                        <ExportExcelButton
                          setId={set.id}
                          scope="admin"
                          variant="secondary"
                          label="⬇ UNDUH REKAP HASIL EXCEL (.XLSX)"
                        />
                      )}

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
                              {(q.indicator || q.subtopic || q.cognitiveLevel) && (
                                <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                  {q.cognitiveLevel ? `[${q.cognitiveLevel}] ` : ""}
                                  {q.subtopic ? `${q.subtopic} — ` : ""}
                                  {q.indicator}
                                </span>
                              )}
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
                            {user.username && user.email.endsWith("@lms.local")
                              ? `@${user.username}`
                              : user.username
                                ? `@${user.username} · ${user.email}`
                                : user.email}
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
