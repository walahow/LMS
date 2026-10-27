"use client";

import React, { useState } from "react";
import { ThemeToggler } from "@/components/ThemeToggler";
import { BoxyProgressBar } from "@/components/BoxyProgressBar";
import { ScoreSwipeOverlay } from "@/components/ScoreSwipeOverlay";

type QuestionData = {
  id: number;
  subject: string;
  topic: string;
  stem: string;
  correctAnswer: string;
  correctReason: string;
  options: { key: string; text: string }[];
  reasons: { key: string; text: string }[];
};

const SAMPLE_QUESTIONS: QuestionData[] = [
  {
    id: 1,
    subject: "FISIKA",
    topic: "HUKUM I NEWTON",
    stem: "Sebuah buku diletakkan di atas meja yang diam. Mengapa buku tersebut tetap diam dan tidak bergerak sendiri?",
    correctAnswer: "B",
    correctReason: "A",
    options: [
      { key: "A", text: "Tidak ada gaya sama sekali yang bekerja pada buku tersebut" },
      { key: "B", text: "Resultan gaya (sigma F) yang bekerja pada buku bernilai nol" },
      { key: "C", text: "Gaya gravitasi bumi berhenti bekerja saat benda diam di meja" },
      { key: "D", text: "Gaya gesek meja lebih besar dari gaya gravitasi bumi" },
    ],
    reasons: [
      { key: "A", text: "Gaya berat ke bawah diimbangi sempurna oleh gaya normal meja ke atas sehingga seimbang" },
      { key: "B", text: "Benda yang diam kehilangan massanya secara perlahan" },
      { key: "C", text: "Hanya benda hidup yang dapat menerima resultan gaya" },
      { key: "D", text: "Meja menahan semua partikel gravitasi dari udara sekitar" },
    ],
  },
  {
    id: 2,
    subject: "FISIKA",
    topic: "HUKUM II NEWTON",
    stem: "Dua balok A (massa 2 kg) dan B (massa 4 kg) didorong dengan gaya yang sama besar di lantai licin. Balok manakah yang mengalami percepatan lebih besar?",
    correctAnswer: "A",
    correctReason: "A",
    options: [
      { key: "A", text: "Balok A mengalami percepatan dua kali lebih besar daripada balok B" },
      { key: "B", text: "Balok B mengalami percepatan lebih besar karena massanya lebih berat" },
      { key: "C", text: "Kedua balok memiliki percepatan sama karena gayanya identik" },
      { key: "D", text: "Tidak dapat ditentukan tanpa mengetahui kecepatan awal masing-masing" },
    ],
    reasons: [
      { key: "A", text: "Percepatan berbanding terbalik dengan massa benda untuk gaya yang konstan (a = F/m)" },
      { key: "B", text: "Benda lebih berat selalu bergerak lebih cepat saat didorong" },
      { key: "C", text: "Massa tidak berpengaruh terhadap percepatan jika lantai licin" },
      { key: "D", text: "Gaya dorong terbagi rata ke seluruh lantai" },
    ],
  },
  {
    id: 3,
    subject: "FISIKA",
    topic: "HUKUM II & III NEWTON",
    stem: "Sebuah balok di lantai licin didorong dengan gaya tetap F. Jika gaya dorong diperbesar menjadi dua kali (2F), bagaimana percepatan balok tersebut?",
    correctAnswer: "B",
    correctReason: "A",
    options: [
      { key: "A", text: "Percepatan balok tetap sama karena massanya tidak berubah" },
      { key: "B", text: "Percepatan balok menjadi dua kali lebih besar dari semula" },
      { key: "C", text: "Percepatan balok menjadi setengah kali semula karena hambatan bertambah" },
      { key: "D", text: "Balok langsung bergerak dengan kecepatan konstan tanpa percepatan" },
    ],
    reasons: [
      { key: "A", text: "Percepatan berbanding lurus dengan resultan gaya yang bekerja pada benda (a ~ F)" },
      { key: "B", text: "Gaya dorong hanya mempengaruhi kecepatan sesaat, bukan percepatan" },
      { key: "C", text: "Massa balok bertambah berat seiring bertambahnya gaya dorong" },
      { key: "D", text: "Lantai licin menghilangkan pengaruh gaya luar pada benda" },
    ],
  },
  {
    id: 4,
    subject: "FISIKA",
    topic: "HUKUM III NEWTON",
    stem: "Saat seekor kuda menarik pedati ke depan, pedati juga menarik kuda ke belakang dengan gaya yang sama besar. Mengapa pedati dan kuda tetap bisa bergerak maju?",
    correctAnswer: "A",
    correctReason: "A",
    options: [
      { key: "A", text: "Gaya kuda pada pedati bekerja pada pedati, sedangkan gaya aksi reaksi tidak saling meniadakan" },
      { key: "B", text: "Gaya kuda pada pedati sebenarnya lebih besar dari tarikan pedati" },
      { key: "C", text: "Hukum III Newton tidak berlaku untuk sistem makhluk hidup" },
      { key: "D", text: "Pedati bergerak karena roda mengurangi gaya reaksi menjadi nol" },
    ],
    reasons: [
      { key: "A", text: "Gaya aksi dan reaksi bekerja pada dua benda yang berbeda, dan ada gaya gesek kaki kuda pada tanah yang mendorong maju" },
      { key: "B", text: "Tarikan kuda terjadi lebih dulu sebelum reaksi pedati muncul" },
      { key: "C", text: "Gaya reaksi hanya muncul jika benda dalam keadaan berhenti" },
      { key: "D", text: "Gaya gravitasi kuda mengalahkan tarikan pedati" },
    ],
  },
  {
    id: 5,
    subject: "FISIKA",
    topic: "GAYA GESEK",
    stem: "Sebuah kotak berat berada di lantai kasar dan didorong dengan gaya kecil F, namun kotak belum bergerak sama sekali. Berapakah besar gaya gesek yang bekerja?",
    correctAnswer: "A",
    correctReason: "A",
    options: [
      { key: "A", text: "Sama besar dengan gaya dorong F (gaya gesek statis = F)" },
      { key: "B", text: "Sama dengan gaya gesek statis maksimum (fs_max)" },
      { key: "C", text: "Nol, karena kotak belum mulai bergerak" },
      { key: "D", text: "Lebih besar dari gaya dorong F sehingga menahan kotak" },
    ],
    reasons: [
      { key: "A", text: "Gaya gesek statis menyesuaikan diri dengan gaya luar yang bekerja hingga mencapai batas maksimumnya" },
      { key: "B", text: "Gaya gesek statis selalu memiliki nilai tetap tidak peduli berapa pun gayanya" },
      { key: "C", text: "Hanya gaya gesek kinetik yang memiliki nilai ketika benda diam" },
      { key: "D", text: "Kotak memiliki gaya internal yang menolak pergeseran" },
    ],
  },
  {
    id: 6,
    subject: "FISIKA",
    topic: "USAHA DAN ENERGI",
    stem: "Seseorang membawa tas ransel seberat 50 N dan berjalan mendatar sejauh 20 meter dengan kecepatan tetap. Berapakah usaha yang dilakukan gaya angkat orang tersebut pada tas?",
    correctAnswer: "A",
    correctReason: "A",
    options: [
      { key: "A", text: "Nol Joule" },
      { key: "B", text: "1000 Joule" },
      { key: "C", text: "500 Joule" },
      { key: "D", text: "25 Joule" },
    ],
    reasons: [
      { key: "A", text: "Arah gaya angkat tegak lurus (90 derajat) terhadap arah perpindahan (W = F . s . cos 90 = 0)" },
      { key: "B", text: "Usaha hanya terjadi jika orang tersebut merasa lelah" },
      { key: "C", text: "Usaha sama dengan perkalian gaya angkat dan jarak tempuh tanpa melihat arah" },
      { key: "D", text: "Tas ransel tidak memiliki energi kinetik" },
    ],
  },
  {
    id: 7,
    subject: "FISIKA",
    topic: "ENERGI POTENSIAL",
    stem: "Dua buah bola identik dijatuhkan dari ketinggian yang berbeda: Bola A dari 10 meter dan Bola B dari 20 meter. Manakah yang memiliki energi potensial gravitasi lebih besar sesaat sebelum dilepas?",
    correctAnswer: "A",
    correctReason: "A",
    options: [
      { key: "A", text: "Bola B memiliki energi potensial dua kali lebih besar daripada Bola A" },
      { key: "B", text: "Bola A memiliki energi potensial lebih besar karena lebih dekat ke bumi" },
      { key: "C", text: "Keduanya memiliki energi potensial sama karena massanya identik" },
      { key: "D", text: "Energi potensial keduanya bernilai nol sebelum bergerak" },
    ],
    reasons: [
      { key: "A", text: "Energi potensial gravitasi berbanding lurus dengan ketinggian benda (Ep = m . g . h)" },
      { key: "B", text: "Semakin tinggi posisi benda, gravitasi bumi justru semakin melemah" },
      { key: "C", text: "Energi potensial hanya bergantung pada kecepatan awal saat dilepas" },
      { key: "D", text: "Massa adalah satu-satunya penentu energi pada benda jatuh bebas" },
    ],
  },
  {
    id: 8,
    subject: "FISIKA",
    topic: "MOMENTUM & IMPULS",
    stem: "Seorang kiper menangkap bola sepak yang melaju kencang dengan menarik tangannya ke belakang mengikuti arah bola. Apa tujuan kiper melakukan hal tersebut?",
    correctAnswer: "A",
    correctReason: "A",
    options: [
      { key: "A", text: "Memperlama waktu kontak sehingga gaya impuls yang dirasakan tangan menjadi lebih kecil" },
      { key: "B", text: "Menambah momentum bola agar bola memantul kembali" },
      { key: "C", text: "Menghilangkan energi kinetik bola seketika tanpa perpindahan" },
      { key: "D", text: "Membuat gaya gravitasi bekerja lebih dominan pada bola" },
    ],
    reasons: [
      { key: "A", text: "Gaya impuls berbanding terbalik dengan selang waktu perubahan momentum (F = delta p / delta t)" },
      { key: "B", text: "Menarik tangan mempercepat laju penyerapan massa bola" },
      { key: "C", text: "Tangan kiper menjadi lebih elastis ketika bergerak mundur" },
      { key: "D", text: "Gaya gesek udara di sekitar sarung tangan meningkat drastis" },
    ],
  },
  {
    id: 9,
    subject: "FISIKA",
    topic: "TUMBUKAN LENTING",
    stem: "Pada tumbukan lenting sempurna antara dua benda, besaran fisik apa sajakah yang kekal?",
    correctAnswer: "A",
    correctReason: "A",
    options: [
      { key: "A", text: "Baik momentum total maupun energi kinetik total keduanya kekal" },
      { key: "B", text: "Hanya momentum total yang kekal, sedangkan energi kinetik berubah menjadi kalor" },
      { key: "C", text: "Hanya energi kinetik yang kekal, momentum selalu berkurang" },
      { key: "D", text: "Kecepatan kedua benda setelah tumbukan selalu menjadi nol" },
    ],
    reasons: [
      { key: "A", text: "Tidak ada energi yang terdisipasi menjadi panas atau deformasi bentuk permanen" },
      { key: "B", text: "Semua jenis tumbukan di alam nyata selalu kehilangan momentum" },
      { key: "C", text: "Gaya gravitasi menyerap seluruh perubahan energi mekanik" },
      { key: "D", text: "Kedua benda bergabung menjadi satu kesatuan massa baru" },
    ],
  },
  {
    id: 10,
    subject: "FISIKA",
    topic: "GRAVITASI NEWTON",
    stem: "Jika jarak antara dua planet digandakan menjadi dua kali semula, bagaimana perubahan gaya gravitasi tarik-menarik antara kedua planet tersebut?",
    correctAnswer: "A",
    correctReason: "A",
    options: [
      { key: "A", text: "Menjadi 1/4 (seperempat) kali dari gaya gravitasi semula" },
      { key: "B", text: "Menjadi 1/2 (setengah) kali dari gaya gravitasi semula" },
      { key: "C", text: "Menjadi 2 kali lebih besar karena ruang antarplanet membesar" },
      { key: "D", text: "Tetap sama karena massa kedua planet tidak berubah" },
    ],
    reasons: [
      { key: "A", text: "Gaya gravitasi berbanding terbalik dengan kuadrat jarak antar kedua pusat massa (F ~ 1/r^2)" },
      { key: "B", text: "Gaya gravitasi hanya berkurang secara linear terhadap jarak" },
      { key: "C", text: "Konstanta gravitasi umum (G) ikut mengecil saat jarak menjauh" },
      { key: "D", text: "Jarak tidak mempengaruhi gaya medan gravitasi di ruang hampa" },
    ],
  },
];

type UserResponse = {
  answerKey?: string;
  reasonKey?: string;
  confident?: boolean;
};

export default function QuizDemoPage() {
  const [currentIdx, setCurrentIdx] = useState(2); // Start at Question 3 (1-based index 3)
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [showScore, setShowScore] = useState(false);
  const [answers, setAnswers] = useState<Record<number, UserResponse>>({
    1: { answerKey: "B", reasonKey: "A", confident: true },
    2: { answerKey: "A", reasonKey: "A", confident: true },
    4: { answerKey: "A", reasonKey: "A", confident: true },
    5: { answerKey: "B", reasonKey: "A", confident: true }, // Miskonsepsi
    6: { answerKey: "A", reasonKey: "A", confident: false }, // Lucky guess
    7: { answerKey: "A", reasonKey: "A", confident: true },
    8: { answerKey: "B", reasonKey: "B", confident: false }, // Tidak paham
    9: { answerKey: "A", reasonKey: "A", confident: true },
    10: { answerKey: "A", reasonKey: "A", confident: true },
  });

  const question = SAMPLE_QUESTIONS[currentIdx];
  const qNum = currentIdx + 1;
  const total = SAMPLE_QUESTIONS.length;

  const currentResponse = answers[qNum] || {};
  const selectedAnswer = currentResponse.answerKey;
  const selectedReason = currentResponse.reasonKey;
  const selectedConfidence = currentResponse.confident;

  // Completed questions are those where answer, reason, and confidence are all selected
  const completedQuestionNumbers = Object.entries(answers)
    .filter(([_, resp]) => resp.answerKey && resp.reasonKey && resp.confident !== undefined)
    .map(([num]) => Number(num));

  // Compute 3-tier diagnostic results across questions
  const computeDiagnosis = () => {
    let paham = 0;
    let miskonsepsi = 0;
    let luckyGuess = 0;
    let tidakPaham = 0;

    SAMPLE_QUESTIONS.forEach((q) => {
      const resp = answers[q.id];
      if (!resp || !resp.answerKey || !resp.reasonKey || resp.confident === undefined) {
        tidakPaham++;
        return;
      }
      const okAns = resp.answerKey === q.correctAnswer;
      const okRsn = resp.reasonKey === q.correctReason;

      if (!resp.confident) {
        if (okAns && okRsn) luckyGuess++;
        else tidakPaham++;
      } else {
        if (okAns && okRsn) paham++;
        else miskonsepsi++;
      }
    });

    const score = Math.round((paham / total) * 100);

    return {
      score,
      counts: { paham, miskonsepsi, luckyGuess, tidakPaham },
    };
  };

  const { score: calculatedScore, counts: diagnosisCounts } = computeDiagnosis();

  const handleSelectAnswer = (key: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        answerKey: key,
      },
    }));
  };

  const handleSelectReason = (key: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        reasonKey: key,
      },
    }));
  };

  const handleSelectConfidence = (val: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        confident: val,
      },
    }));
  };

  const handleFinishQuiz = () => {
    setShowScore(true);
  };

  const handleNext = () => {
    if (currentIdx < total - 1) {
      setDirection("forward");
      setCurrentIdx(currentIdx + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setDirection("backward");
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Mobile-First Sticky Navbar (Pinned at top when scrolling) */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          backgroundColor: "var(--color-bg)",
          borderBottom: "1.5px solid var(--color-border)",
          display: "flex",
          justifyContent: "center",
          padding: "10px 12px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {/* Left: Subject Badge (LMS DIAGNOSTIK removed as requested) */}
          <div
            className="font-mono"
            style={{
              padding: "6px 10px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              fontWeight: 800,
              fontSize: "12px",
              border: "1.5px solid var(--color-border)",
              boxShadow: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: "var(--color-accent)",
              }}
            />
            {question.subject}
          </div>

          {/* Right: Controls (Progress Bar, Theme Toggler, Selesai) */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BoxyProgressBar
              currentQuestion={qNum}
              totalQuestions={total}
              completedQuestions={completedQuestionNumbers}
              onSelectQuestion={(num) => {
                const targetIdx = num - 1;
                if (targetIdx !== currentIdx) {
                  setDirection(targetIdx > currentIdx ? "forward" : "backward");
                  setCurrentIdx(targetIdx);
                }
              }}
            />

            <ThemeToggler />

            <button
              type="button"
              onClick={handleFinishQuiz}
              className="font-mono boxy-pressable-md"
              style={{
                height: "36px",
                padding: "0 12px",
                backgroundColor: "var(--color-accent)",
                color: "var(--color-accent-contrast)",
                border: "1.5px solid var(--color-border)",
                boxShadow: "var(--shadow-boxy)", // 4px shadow (more prominent than progress bar)
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "0.04em",
                cursor: "pointer",
                flexShrink: 0,
              }}
              title="Selesaikan kuis dan lihat hasil skor"
            >
              SELESAI ➔
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Mobile Viewport: 440px) */}
      <main
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "16px 12px 64px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Direction-Aware Question Deck Container */}
        <div
          key={currentIdx}
          className={direction === "forward" ? "slide-forward" : "slide-backward"}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            width: "100%",
          }}
        >
          {/* Main Question Card in View (Subtle overshadow for focus) */}
        <div
          className="boxy-card-active"
          style={{
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Card Top Meta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1.5px dashed var(--color-border)",
              paddingBottom: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                className="font-mono"
                style={{
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "var(--color-accent)",
                }}
              >
                {String(qNum).padStart(2, "0")}
              </span>
              <span style={{ opacity: 0.3 }}>/</span>
              <span
                className="font-mono"
                style={{ fontSize: "11px", fontWeight: 700, opacity: 0.7 }}
              >
                {question.topic}
              </span>
            </div>
          </div>

          {/* Stem Text */}
          <h2
            style={{
              fontSize: "16.5px",
              lineHeight: 1.45,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            {question.stem}
          </h2>
        </div>

        {/* TIER 1: PILIHAN JAWABAN (Flat container, shadow ONLY on selected) */}
        <section
          className="boxy-card-flat"
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Tier 1 Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              className="font-mono"
              style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              PILIH JAWABAN
            </h3>
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {question.options.map((opt) => {
              const isSelected = selectedAnswer === opt.key;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectAnswer(opt.key)}
                  className={`option-row ${isSelected ? "selected" : ""}`}
                >
                  {/* High-visibility Dither Effect Overlay on Selected */}
                  {isSelected && (
                    <div
                      className="dither-overlay-accent"
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.35, // High contrast visible dither
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {/* Option Letter Badge */}
                  <div
                    className="font-mono"
                    style={{
                      width: "28px",
                      height: "28px",
                      border: "1.5px solid var(--color-border)",
                      backgroundColor: isSelected
                        ? "var(--color-accent)"
                        : "var(--color-surface-dim)",
                      color: isSelected
                        ? "var(--color-accent-contrast)"
                        : "var(--color-text)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "13px",
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    {opt.key}
                  </div>

                  {/* Option Text */}
                  <span
                    style={{
                      fontSize: "13.5px",
                      lineHeight: 1.4,
                      fontWeight: isSelected ? 700 : 500,
                      flexGrow: 1,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    {opt.text}
                  </span>

                  {/* Selected check */}
                  {isSelected && (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "15px",
                        fontWeight: 900,
                        color: "var(--color-accent)",
                        paddingRight: "2px",
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* PILIHAN ALASAN (Unlocks after Jawaban) */}
        {selectedAnswer ? (
          <section
            className="boxy-card-flat tier-box-expand"
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              className="tier-content-reveal"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h3
                  className="font-mono"
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    margin: 0,
                  }}
                >
                  PILIH ALASAN
                </h3>
              </div>

              {/* Reasons List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {question.reasons.map((rsn) => {
                  const isSelected = selectedReason === rsn.key;

                  return (
                    <button
                      key={rsn.key}
                      type="button"
                      onClick={() => handleSelectReason(rsn.key)}
                      className={`option-row ${isSelected ? "selected" : ""}`}
                    >
                      {/* High-visibility Dither Effect Overlay on Selected */}
                      {isSelected && (
                        <div
                          className="dither-overlay-accent"
                          style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.35,
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {/* Reason Letter Badge */}
                      <div
                        className="font-mono"
                        style={{
                          width: "28px",
                          height: "28px",
                          border: "1.5px solid var(--color-border)",
                          backgroundColor: isSelected
                            ? "var(--color-accent)"
                            : "var(--color-surface-dim)",
                          color: isSelected
                            ? "var(--color-accent-contrast)"
                            : "var(--color-text)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: "13px",
                          flexShrink: 0,
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        {rsn.key}
                      </div>

                      {/* Reason Text */}
                      <span
                        style={{
                          fontSize: "13px",
                          lineHeight: 1.4,
                          fontWeight: isSelected ? 700 : 500,
                          flexGrow: 1,
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        {rsn.text}
                      </span>

                      {/* Selected check */}
                      {isSelected && (
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "15px",
                            fontWeight: 900,
                            color: "var(--color-accent)",
                            paddingRight: "2px",
                            position: "relative",
                            zIndex: 2,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          /* Locked placeholder for Tier 2 */
          <div
            className="boxy-card-flat"
            style={{
              padding: "14px 16px",
              opacity: 0.45,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderStyle: "dashed",
            }}
          >
            <span className="font-mono" style={{ fontSize: "12px", fontWeight: 700 }}>
              PILIH ALASAN
            </span>
          </div>
        )}

        {/* TINGKAT KEYAKINAN (Unlocks after Alasan) */}
        {selectedReason ? (
          <section
            className="boxy-card-flat tier-box-expand"
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              className="tier-content-reveal"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h3
                  className="font-mono"
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    margin: 0,
                  }}
                >
                  TINGKAT KEYAKINAN
                </h3>
              </div>

              <p style={{ margin: 0, fontSize: "12.5px", color: "var(--color-text-muted)" }}>
                Apakah kamu yakin dengan pasangan jawaban dan alasan di atas?
              </p>

              {/* Confidence Choice Buttons (Mobile Friendly) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                {/* YAKIN */}
                <button
                  type="button"
                  onClick={() => handleSelectConfidence(true)}
                  className={`boxy-btn ${selectedConfidence === true ? "selected" : ""}`}
                  style={{
                    height: "48px",
                    fontSize: "14px",
                    fontWeight: 800,
                    border: selectedConfidence === true ? "2px solid var(--color-accent)" : "1.5px solid var(--color-border)",
                    backgroundColor:
                      selectedConfidence === true
                        ? "var(--color-accent)"
                        : "var(--color-surface)",
                    color:
                      selectedConfidence === true
                        ? "var(--color-accent-contrast)"
                        : "var(--color-text)",
                    transform: selectedConfidence === true ? "scale(1.02)" : "none",
                    boxShadow:
                      selectedConfidence === true
                        ? "var(--shadow-boxy-accent)"
                        : "none", // No shadow on unselected
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {selectedConfidence === true && (
                    <div
                      className="dither-overlay-solid"
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.35,
                      }}
                    />
                  )}
                  <span style={{ position: "relative", zIndex: 2 }}>[ YAKIN ]</span>
                </button>

                {/* TIDAK YAKIN */}
                <button
                  type="button"
                  onClick={() => handleSelectConfidence(false)}
                  className={`boxy-btn ${selectedConfidence === false ? "selected" : ""}`}
                  style={{
                    height: "48px",
                    fontSize: "14px",
                    fontWeight: 800,
                    border: selectedConfidence === false ? "2px solid var(--color-border)" : "1.5px solid var(--color-border)",
                    backgroundColor:
                      selectedConfidence === false
                        ? "var(--color-surface-dim)"
                        : "var(--color-surface)",
                    color: "var(--color-text)",
                    transform: selectedConfidence === false ? "scale(1.02)" : "none",
                    boxShadow:
                      selectedConfidence === false
                        ? "var(--shadow-boxy-xs)"
                        : "none", // No shadow on unselected
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {selectedConfidence === false && (
                    <div
                      className="dither-overlay"
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.45,
                      }}
                    />
                  )}
                  <span style={{ position: "relative", zIndex: 2 }}>[ TIDAK YAKIN ]</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          /* Locked placeholder for Tier 3 */
          <div
            className="boxy-card-flat"
            style={{
              padding: "14px 16px",
              opacity: 0.45,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderStyle: "dashed",
            }}
          >
            <span className="font-mono" style={{ fontSize: "12px", fontWeight: 700 }}>
              TINGKAT KEYAKINAN
            </span>
          </div>
        )}
        </div>

        {/* Bottom Navigation & Controls (Thumb-friendly for mobile) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "6px",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="boxy-btn font-mono"
            style={{
              flex: 1,
              height: "44px",
              padding: "0 14px",
              fontSize: "13px",
              opacity: currentIdx === 0 ? 0.35 : 1,
              cursor: currentIdx === 0 ? "not-allowed" : "pointer",
              boxShadow: currentIdx === 0 ? "none" : "var(--shadow-boxy-xs)",
            }}
          >
            ❮ SEBELUMNYA
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="boxy-btn boxy-btn-accent font-mono"
            style={{
              flex: 1,
              height: "44px",
              padding: "0 14px",
              fontSize: "13px",
            }}
          >
            {currentIdx === total - 1 ? "SELESAI ➔" : "BERIKUTNYA ❯"}
          </button>
        </div>
      </main>

      {/* Fullscreen Mobile Swipe Overlay with Number Ticker */}
      <ScoreSwipeOverlay
        isOpen={showScore}
        score={calculatedScore}
        diagnosisCounts={diagnosisCounts}
        totalQuestions={total}
        onClose={() => setShowScore(false)}
        onReview={() => {
          setShowScore(false);
          setDirection("backward");
          setCurrentIdx(0);
        }}
      />
    </div>
  );
}
