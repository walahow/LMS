"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BoxyProgressBar } from "@/components/BoxyProgressBar";
import { ScoreSwipeOverlay } from "@/components/ScoreSwipeOverlay";
import { Spinner } from "@/components/Spinner";

export type QuestionData = {
  id: number;
  subject: string;
  topic: string;
  stem: string;
  correctAnswer: string;
  correctReason: string;
  explanation: string;
  options: { key: string; text: string }[];
  reasons: { key: string; text: string }[];
};

export const SAMPLE_QUESTIONS: QuestionData[] = [
  {
    id: 1,
    subject: "FISIKA",
    topic: "HUKUM I NEWTON",
    stem: "Sebuah buku diletakkan di atas meja yang diam. Mengapa buku tersebut tetap diam dan tidak bergerak sendiri?",
    correctAnswer: "B",
    correctReason: "A",
    explanation: "Berdasarkan Hukum I Newton (Kelembaman), buku yang diam di atas meja memiliki resultan gaya sama dengan nol (ΣF = 0). Gaya gravitasi ke bawah diseimbangkan sempurna oleh gaya normal dari permukaan meja ke atas, bukan karena ketiadaan gravitasi.",
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
    explanation: "Menurut Hukum II Newton (a = F/m), untuk besar gaya yang sama, percepatan berbanding terbalik dengan massa benda. Karena massa balok A (2 kg) adalah setengah dari massa balok B (4 kg), maka percepatan balok A bernilai dua kali lipat lebih besar.",
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
    explanation: "Hukum II Newton menyatakan bahwa percepatan berbanding lurus dengan resultan gaya luar yang bekerja pada benda (a ~ F). Jika gaya dorong dilipatgandakan menjadi 2F sedangkan massa balok tetap, maka percepatan balok otomatis menjadi dua kali semula.",
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
    explanation: "Menurut Hukum III Newton, gaya aksi (kuda menarik pedati) dan gaya reaksi (pedati menarik kuda) bekerja pada dua benda yang berbeda sehingga tidak pernah saling meniadakan. Kuda dan pedati bergerak maju karena adanya gaya gesek antara telapak kaki kuda dan tanah yang mendorong seluruh sistem ke depan.",
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
    explanation: "Selama kotak belum bergerak, gaya gesek yang bekerja adalah gaya gesek statis. Sifat gaya gesek statis adalah menyesuaikan diri persis sama besar dengan gaya dorong luar (fs = F) hingga mencapai batas maksimumnya (fs_max) sebelum benda mulai bergerak.",
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
    explanation: "Usaha (W) didefinisikan sebagai W = F . s . cos(θ). Karena arah gaya angkat vertikal ke atas sedangkan perpindahan tas horizontal mendatar, sudut keduanya adalah 90 derajat (cos 90° = 0). Maka usaha oleh gaya angkat bernilai nol Joule.",
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
    explanation: "Energi potensial gravitasi dihitung dengan rumus Ep = m . g . h. Karena massa (m) dan percepatan gravitasi (g) kedua bola sama, bola B yang dijatuhkan dari ketinggian 20 m memiliki energi potensial dua kali lebih besar daripada bola A di ketinggian 10 m.",
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
    explanation: "Kiper menarik tangannya ke belakang untuk memperpanjang selang waktu kontak (Δt) saat menghentikan bola. Berdasarkan hubungan impuls dan momentum (F = Δp / Δt), memperbesar Δt akan memperkecil gaya impak (F) yang dirasakan tangan kiper sehingga tidak cedera.",
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
    explanation: "Pada peristiwa tumbukan lenting sempurna (e = 1), tidak ada energi kinetik yang terdisipasi menjadi panas, bunyi, atau deformasi permanen. Oleh karena itu, hukum kekekalan momentum dan hukum kekekalan energi kinetik keduanya berlaku penuh.",
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
    explanation: "Hukum Gravitasi Universal Newton menyatakan bahwa gaya tarik gravitasi berbanding terbalik dengan kuadrat jarak antara kedua pusat massa (F ~ 1/r^2). Jika jarak digandakan menjadi 2r, gaya tarik gravitasi berkurang menjadi 1/(2^2) = 1/4 kali gaya semula.",
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

export type UserResponse = {
  answerKey?: string;
  reasonKey?: string;
  confident?: boolean;
};

export type QuizRunnerViewProps = {
  setId?: string;
  setTitle?: string;
  subject?: string;
  questions: QuestionData[];
  initialAnswers?: Record<number, UserResponse>;
  initialIdx?: number;
  onSubmitQuiz?: (answers: Record<number, UserResponse>) => Promise<any>;
};

export function QuizRunnerView({
  setId,
  setTitle,
  subject: initialSubject,
  questions,
  initialAnswers,
  initialIdx = 0,
  onSubmitQuiz,
}: QuizRunnerViewProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [showScore, setShowScore] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [incompleteAlert, setIncompleteAlert] = useState<{ numbers: number[] } | null>(null);
  const [answers, setAnswers] = useState<Record<number, UserResponse>>(initialAnswers || {});

  const total = questions.length;
  const safeIdx = Math.min(Math.max(0, currentIdx), Math.max(0, total - 1));
  const question = questions[safeIdx] || questions[0];
  const qNum = safeIdx + 1;

  const currentResponse = answers[qNum] || {};
  const selectedAnswer = currentResponse.answerKey;
  const selectedReason = currentResponse.reasonKey;
  const selectedConfidence = currentResponse.confident;

  // Completed questions are those where answer, reason, and confidence are all selected
  const completedQuestionNumbers = Object.entries(answers)
    .filter(([, resp]) => resp.answerKey && resp.reasonKey && resp.confident !== undefined)
    .map(([num]) => Number(num));

  // Compute 3-tier diagnostic results across questions
  const computeDiagnosis = () => {
    let paham = 0;
    let miskonsepsi = 0;
    let luckyGuess = 0;
    let tidakPaham = 0;

    questions.forEach((q) => {
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
    if (isReviewMode) return;
    setAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        answerKey: key,
      },
    }));
  };

  const handleSelectReason = (key: string) => {
    if (isReviewMode) return;
    setAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        reasonKey: key,
      },
    }));
  };

  const handleSelectConfidence = (val: boolean) => {
    if (isReviewMode) return;
    setAnswers((prev) => ({
      ...prev,
      [qNum]: {
        ...prev[qNum],
        confident: val,
      },
    }));
  };

  // Cari daftar nomor butir soal yang belum lengkap seluruh tingkatannya
  const getIncompleteQuestions = () => {
    const incomplete: number[] = [];
    for (let i = 1; i <= total; i++) {
      const resp = answers[i];
      const hasAnswer = Boolean(resp?.answerKey);
      const hasReason = Boolean(resp?.reasonKey);
      const hasConfidence = resp?.confident !== undefined;
      if (!hasAnswer || !hasReason || !hasConfidence) {
        incomplete.push(i);
      }
    }
    return incomplete;
  };

  const handleFinishQuiz = async () => {
    if (isReviewMode) {
      router.push("/dashboard");
      return;
    }

    // Validasi kelengkapan jawaban: tidak boleh menyimpan jika belum lengkap semua
    const incomplete = getIncompleteQuestions();
    if (incomplete.length > 0) {
      setIncompleteAlert({ numbers: incomplete });
      return;
    }

    if (isSubmitting) return;

    // Bersihkan alert kelengkapan jika valid
    setIncompleteAlert(null);

    if (onSubmitQuiz && !hasSubmitted) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmitQuiz(answers);
        setHasSubmitted(true);
      } catch (err: any) {
        console.error("Gagal menyimpan hasil kuis ke database:", err);
        setSubmitError(err?.message || "Gagal menyimpan jawaban ke database.");
      } finally {
        setIsSubmitting(false);
      }
    }

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
          {/* Left: Subject Badge or Review Mode Badge */}
          <div
            className="font-mono"
            style={{
              padding: "6px 10px",
              backgroundColor: isReviewMode ? "var(--color-accent)" : "var(--color-surface)",
              color: isReviewMode ? "var(--color-accent-contrast)" : "var(--color-text)",
              fontWeight: 800,
              fontSize: "12px",
              border: "1.5px solid var(--color-border)",
              boxShadow: isReviewMode ? "var(--shadow-boxy-accent)" : "none",
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
                backgroundColor: isReviewMode ? "var(--color-accent-contrast)" : "var(--color-accent)",
              }}
            />
            {isReviewMode ? "MODE ULAS JAWABAN" : question.subject}
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

            {isReviewMode ? (
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="font-mono boxy-pressable-md"
                style={{
                  height: "36px",
                  padding: "0 12px",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  border: "1.5px solid var(--color-border)",
                  boxShadow: "var(--shadow-boxy-xs)",
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                title="Keluar dari ulasan dan kembali ke dashboard"
              >
                KELUAR ➔
              </button>
            ) : (
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
                  boxShadow: "var(--shadow-boxy)",
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
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (Mobile Viewport: 440px) */}
      <main
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "20px 12px 64px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Direction-Aware Question Deck Container */}
        <div
          key={currentIdx}
          className={direction === "forward" ? "slide-forward" : "slide-backward"}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            width: "100%",
          }}
        >
          {/* Main Question Card in View (Subtle overshadow for focus) */}
          <div
            className="boxy-card-active"
            style={{
              padding: "18px 20px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Gradual Right-to-Left Fading Dither Background */}
            <div className="dither-fade-right" aria-hidden="true" />
            {/* Card Top Meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1.5px dashed var(--color-border)",
                paddingBottom: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "12px",
                    fontWeight: 900,
                    padding: "2px 7px",
                    backgroundColor: "var(--color-accent-dim)",
                    color: "var(--color-accent)",
                    border: "1px solid var(--color-accent)",
                  }}
                >
                  SOAL {String(qNum).padStart(2, "0")}
                </span>
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
                fontSize: "17.5px",
                lineHeight: 1.55,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {question.stem}
            </h2>
          </div>

          {/* TIER 1: PILIHAN JAWABAN */}
          <section
            className="boxy-card-flat"
            style={{
              padding: "20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Jawaban Header */}
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
                  fontSize: "12.5px",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  margin: 0,
                }}
              >
                PILIHAN JAWABAN
              </h3>
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {question.options.map((opt) => {
                const isSelected = selectedAnswer === opt.key;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isReviewMode}
                    onClick={() => handleSelectAnswer(opt.key)}
                    className={`option-row ${isSelected ? "selected" : ""} ${isReviewMode ? "review-locked" : ""}`}
                    style={{
                      cursor: isReviewMode ? "default" : "pointer",
                    }}
                  >
                    {/* Gradual Right-to-Left Fading Dither Effect on Selected */}
                    {isSelected && (
                      <div
                        className="dither-fade-right-accent"
                        style={{
                          width: "75%",
                          opacity: 0.5,
                          pointerEvents: "none",
                        }}
                        aria-hidden="true"
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
                        marginTop: "1px",
                      }}
                    >
                      {opt.key}
                    </div>

                    {/* Option Text */}
                    <span
                      style={{
                        fontSize: "13.5px",
                        lineHeight: 1.45,
                        fontWeight: isSelected ? 700 : 500,
                        flexGrow: 1,
                        position: "relative",
                        zIndex: 2,
                        paddingTop: "3px",
                      }}
                    >
                      {opt.text}
                    </span>

                    {/* Review badges */}
                    {isReviewMode && (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", position: "relative", zIndex: 2 }}>
                        {opt.key === question.correctAnswer && (
                          <span
                            className="badge-mono font-mono"
                            style={{
                              fontSize: "10px",
                              borderColor: "#0EA47A",
                              color: "#0EA47A",
                              backgroundColor: "rgba(14, 164, 122, 0.1)",
                              flexShrink: 0,
                            }}
                          >
                            KUNCI ✓
                          </span>
                        )}
                        {isSelected && (
                          <span
                            className="badge-mono font-mono"
                            style={{
                              fontSize: "10px",
                              borderColor: opt.key === question.correctAnswer ? "#0EA47A" : "#E11D48",
                              color: opt.key === question.correctAnswer ? "#0EA47A" : "#E11D48",
                              backgroundColor: opt.key === question.correctAnswer ? "rgba(14, 164, 122, 0.1)" : "rgba(225, 29, 72, 0.1)",
                              flexShrink: 0,
                            }}
                          >
                            {opt.key === question.correctAnswer ? "PILIHANMU ✓" : "PILIHANMU ✗"}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Selected check */}
                    {!isReviewMode && isSelected && (
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "15px",
                          fontWeight: 900,
                          color: "var(--color-accent)",
                          paddingRight: "2px",
                          paddingTop: "3px",
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

          {/* TIER 2: PILIHAN ALASAN (Unlocks after Jawaban) */}
          {selectedAnswer ? (
            <section
              className="boxy-card-flat tier-box-expand"
              style={{
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                className="tier-content-reveal"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
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
                      fontSize: "12.5px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      margin: 0,
                    }}
                  >
                    PILIHAN ALASAN
                  </h3>
                </div>

                {/* Reasons List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {question.reasons.map((rsn) => {
                    const isSelected = selectedReason === rsn.key;

                    return (
                      <button
                        key={rsn.key}
                        type="button"
                        disabled={isReviewMode}
                        onClick={() => handleSelectReason(rsn.key)}
                        className={`option-row ${isSelected ? "selected" : ""} ${isReviewMode ? "review-locked" : ""}`}
                        style={{
                          cursor: isReviewMode ? "default" : "pointer",
                        }}
                      >
                        {/* Gradual Right-to-Left Fading Dither Effect on Selected */}
                        {isSelected && (
                          <div
                            className="dither-fade-right-accent"
                            style={{
                              width: "75%",
                              opacity: 0.5,
                              pointerEvents: "none",
                            }}
                            aria-hidden="true"
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
                            marginTop: "1px",
                          }}
                        >
                          {rsn.key}
                        </div>

                        {/* Reason Text */}
                        <span
                          style={{
                            fontSize: "13px",
                            lineHeight: 1.45,
                            fontWeight: isSelected ? 700 : 500,
                            flexGrow: 1,
                            position: "relative",
                            zIndex: 2,
                            paddingTop: "3px",
                          }}
                        >
                          {rsn.text}
                        </span>

                        {/* Review badges */}
                        {isReviewMode && (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", position: "relative", zIndex: 2 }}>
                            {rsn.key === question.correctReason && (
                              <span
                                className="badge-mono font-mono"
                                style={{
                                  fontSize: "10px",
                                  borderColor: "#0EA47A",
                                  color: "#0EA47A",
                                  backgroundColor: "rgba(14, 164, 122, 0.1)",
                                  flexShrink: 0,
                                }}
                              >
                                KUNCI ✓
                              </span>
                            )}
                            {isSelected && (
                              <span
                                className="badge-mono font-mono"
                                style={{
                                  fontSize: "10px",
                                  borderColor: rsn.key === question.correctReason ? "#0EA47A" : "#E11D48",
                                  color: rsn.key === question.correctReason ? "#0EA47A" : "#E11D48",
                                  backgroundColor: rsn.key === question.correctReason ? "rgba(14, 164, 122, 0.1)" : "rgba(225, 29, 72, 0.1)",
                                  flexShrink: 0,
                                }}
                              >
                                {rsn.key === question.correctReason ? "ALASANMU ✓" : "ALASANMU ✗"}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Selected check */}
                        {!isReviewMode && isSelected && (
                          <span
                            className="font-mono"
                            style={{
                              fontSize: "15px",
                              fontWeight: 900,
                              color: "var(--color-accent)",
                              paddingRight: "2px",
                              paddingTop: "3px",
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
                padding: "16px 18px",
                opacity: 0.6,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                borderStyle: "dashed",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="font-mono" style={{ fontSize: "12px", fontWeight: 700 }}>
                  PILIHAN ALASAN
                </span>
                <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  [ TERKUNCI 🔒 ]
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                Pilih jawaban di atas terlebih dahulu untuk membuka pilihan alasan.
              </p>
            </div>
          )}

          {/* Review Mode Diagnostic Banner */}
          {isReviewMode && (
            <div
              className="boxy-card-flat font-mono"
              style={{
                padding: "12px 16px",
                backgroundColor: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                boxShadow: "var(--shadow-boxy-xs)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--color-text-muted)" }}>
                DIAGNOSIS BUTIR #{qNum}:
              </span>
              {(() => {
                const ansOk = selectedAnswer === question.correctAnswer;
                const rsnOk = selectedReason === question.correctReason;
                const conf = selectedConfidence;
                if (conf) {
                  return ansOk && rsnOk ? (
                    <span style={{ fontSize: "11px", fontWeight: 900, color: "#0EA47A" }}>
                      ✓ PAHAM KONSEP
                    </span>
                  ) : (
                    <span style={{ fontSize: "11px", fontWeight: 900, color: "#E11D48" }}>
                      ⚠ MISKONSEPSI
                    </span>
                  );
                } else {
                  return ansOk && rsnOk ? (
                    <span style={{ fontSize: "11px", fontWeight: 900, color: "#F5A524" }}>
                      ✦ LUCKY GUESS
                    </span>
                  ) : (
                    <span style={{ fontSize: "11px", fontWeight: 900, color: "var(--color-text-muted)" }}>
                      ✗ TIDAK PAHAM
                    </span>
                  );
                }
              })()}
            </div>
          )}

          {/* TIER 3: TINGKAT KEYAKINAN (Unlocks after Alasan) */}
          {selectedReason || isReviewMode ? (
            <section
              className="boxy-card-flat tier-box-expand"
              style={{
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                className="tier-content-reveal"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
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
                      fontSize: "12.5px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      margin: 0,
                    }}
                  >
                    TINGKAT KEYAKINAN
                  </h3>
                </div>

                <p style={{ margin: 0, fontSize: "12.5px", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
                  Apakah kamu yakin dengan pasangan jawaban dan alasan di atas?
                </p>

                {/* Confidence Choice Buttons (Mobile Friendly) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {/* YAKIN */}
                  <button
                    type="button"
                    disabled={isReviewMode}
                    onClick={() => handleSelectConfidence(true)}
                    className={`boxy-btn ${selectedConfidence === true ? "selected" : ""}`}
                    style={{
                      height: "50px",
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
                          : "none",
                      position: "relative",
                      overflow: "hidden",
                      cursor: isReviewMode ? "default" : "pointer",
                    }}
                  >
                    {selectedConfidence === true && (
                      <div
                        className="dither-fade-right-accent"
                        style={{
                          width: "80%",
                          opacity: 0.55,
                          pointerEvents: "none",
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <span style={{ position: "relative", zIndex: 2 }}>[ YAKIN ]</span>
                  </button>

                  {/* TIDAK YAKIN */}
                  <button
                    type="button"
                    disabled={isReviewMode}
                    onClick={() => handleSelectConfidence(false)}
                    className={`boxy-btn ${selectedConfidence === false ? "selected" : ""}`}
                    style={{
                      height: "50px",
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
                          : "none",
                      position: "relative",
                      overflow: "hidden",
                      cursor: isReviewMode ? "default" : "pointer",
                    }}
                  >
                    {selectedConfidence === false && (
                      <div
                        className="dither-fade-right"
                        style={{
                          width: "80%",
                          opacity: 0.45,
                          pointerEvents: "none",
                        }}
                        aria-hidden="true"
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
                padding: "16px 18px",
                opacity: 0.6,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                borderStyle: "dashed",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="font-mono" style={{ fontSize: "12px", fontWeight: 700 }}>
                  TINGKAT KEYAKINAN
                </span>
                <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  [ TERKUNCI 🔒 ]
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                Pilih alasan di atas terlebih dahulu untuk konfirmasi keyakinan.
              </p>
            </div>
          )}

          {/* Explanation Box (Visible in Review Mode) */}
          {isReviewMode && question.explanation && (
            <section
              className="boxy-card-flat"
              style={{
                position: "relative",
                overflow: "hidden",
                padding: "18px 20px",
                backgroundColor: "var(--color-surface)",
                border: "2px solid var(--color-accent)",
                boxShadow: "var(--shadow-boxy-accent)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {/* Gradual Right-to-Left Fading Dither */}
              <div className="dither-fade-right-accent" aria-hidden="true" />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>💡</span>
                  <h3
                    className="font-mono"
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 900,
                      letterSpacing: "0.04em",
                      color: "var(--color-accent)",
                      margin: 0,
                    }}
                  >
                    PENJELASAN KONSEP & ALASAN BENAR
                  </h3>
                </div>
                <span
                  className="badge-mono font-mono"
                  style={{
                    fontSize: "10px",
                    borderColor: "var(--color-accent)",
                    color: "var(--color-accent)",
                  }}
                >
                  KUNCI: [{question.correctAnswer} + {question.correctReason}]
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  lineHeight: 1.55,
                  color: "var(--color-text)",
                }}
              >
                {question.explanation}
              </p>
            </section>
          )}
        </div>

        {/* Bottom Navigation & Controls (Thumb-friendly for mobile) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "16px",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="boxy-btn font-mono"
            style={{
              flex: 1,
              height: "46px",
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
              height: "46px",
              padding: "0 14px",
              fontSize: "13px",
            }}
          >
            {currentIdx === total - 1
              ? isReviewMode
                ? "KEMBALI KE BERANDA ➔"
                : "SELESAI ➔"
              : "BERIKUTNYA ❯"}
          </button>
        </div>
      </main>

      {/* Centered Neo-Brutalist Submission Loading Overlay */}
      {isSubmitting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(6, 13, 36, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <Spinner
            fullScreen={false}
            label="MENYIMPAN JAWABAN..."
            sublabel="Mencatat respons 3-tier ke database..."
          />
        </div>
      )}

      {/* Fullscreen Mobile Swipe Overlay with Number Ticker */}
      <ScoreSwipeOverlay
        isOpen={showScore}
        score={calculatedScore}
        diagnosisCounts={diagnosisCounts}
        totalQuestions={total}
        submitError={submitError}
        onClose={() => {
          setShowScore(false);
          router.push("/dashboard");
        }}
        onReview={() => {
          setShowScore(false);
          setIsReviewMode(true);
          setDirection("backward");
          setCurrentIdx(0);
        }}
      />

      {/* Incomplete Questions Notification Toast */}
      {incompleteAlert && (
        <div
          role="alert"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "calc(100% - 24px)",
            maxWidth: "460px",
            backgroundColor: "var(--color-surface)",
            border: "2px solid #E11D48",
            boxShadow: "0 6px 20px rgba(225, 29, 72, 0.25), var(--shadow-boxy-lg)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            animation: "toastSlideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                className="font-mono"
                style={{
                  backgroundColor: "#E11D48",
                  color: "#FFFFFF",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                }}
              >
                BELUM LENGKAP
              </span>
              <span style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--color-text)" }}>
                {incompleteAlert.numbers.length} Soal Belum Lengkap
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIncompleteAlert(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "16px",
                fontWeight: 900,
                cursor: "pointer",
                padding: "0 4px",
              }}
              title="Tutup pemberitahuan"
            >
              ✕
            </button>
          </div>

          <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
            Semua tingkatan (jawaban, alasan, dan keyakinan) wajib diisi sebelum menyimpan:
          </p>

          {/* Clickable Question Chips that jump directly to that incomplete question */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {incompleteAlert.numbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setDirection(num - 1 > currentIdx ? "forward" : "backward");
                  setCurrentIdx(num - 1);
                  setIncompleteAlert(null);
                }}
                className="font-mono boxy-pressable-sm"
                style={{
                  padding: "4px 8px",
                  fontSize: "11px",
                  fontWeight: 900,
                  backgroundColor: "rgba(225, 29, 72, 0.10)",
                  border: "1.5px solid #E11D48",
                  color: "#E11D48",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title={`Lompat ke Soal ${num}`}
              >
                <span>SOAL {String(num).padStart(2, "0")}</span>
                <span>➔</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
