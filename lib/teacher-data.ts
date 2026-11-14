import { cookies } from "next/headers";
import { requireRole } from "@/lib/auth";
import { isMissingColumnError } from "@/lib/auth-utils";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { calculateTier1Score, diagnose, type Diagnosis } from "@/lib/diagnose";
import type { ExportQuestionMeta } from "@/lib/export-spreadsheet";

export type DiagnosticCount = {
  paham: number;
  miskonsepsi: number;
  lucky_guess: number;
  tidak_paham: number;
};

export type StudentQuestionDetail = {
  questionId: string;
  position: number;
  stem: string;
  options: string[];
  reasons: string[];
  studentAnswer: number;
  correctOption: number;
  studentReason: number;
  correctReason: number;
  confident: boolean;
  diagnosis: Diagnosis;
  explanation?: string;
  indicator?: string;
  subtopic?: string;
  cognitiveLevel?: string;
};

export type StudentPackResult = {
  studentId: string;
  fullName: string;
  initials: string;
  grade: string;
  attemptId: string;
  submittedAt: string;
  score: number;
  diagnosticsCount: DiagnosticCount;
  dominantDiagnosis: Diagnosis;
  questions: StudentQuestionDetail[];
};

export type TeacherTestPack = {
  id: string;
  title: string;
  indicator: string;
  subject: string;
  grade?: string;
  published?: boolean;
  questionCount: number;
  studentAttemptCount: number;
  totalStudents: number;
  diagnosticsCount: DiagnosticCount;
  students: StudentPackResult[];
};

export type TeacherProfileInfo = {
  fullName: string;
  initials: string;
  email?: string;
  title?: string;
};

export type TeacherStats = {
  totalPacks: number;
  averageScore: number;
  activeStudents: number;
  totalStudents: number;
  participationRate: number;
};

export const MOCK_TEACHER: TeacherProfileInfo = {
  fullName: "Severus Snape",
  initials: "SS",
  email: "teacher@lms.local",
  title: "Guru Pengampu Fisika & Sains",
};

// =========================================================================
// BUILDER HELPERS FOR 100% RECONCILED DATA INTEGRITY
// =========================================================================

function buildStudentResult(
  student: { id: string; fullName: string; grade: string; attemptId: string; submittedAt: string },
  questions: Array<Omit<StudentQuestionDetail, "diagnosis">>
): StudentPackResult {
  const diagnosticsCount: DiagnosticCount = { paham: 0, miskonsepsi: 0, lucky_guess: 0, tidak_paham: 0 };

  const fullQuestions: StudentQuestionDetail[] = questions.map((q) => {
    const d = diagnose(
      { answer: q.studentAnswer, reason: q.studentReason, confident: q.confident },
      { correct_option: q.correctOption, correct_reason: q.correctReason }
    );
    diagnosticsCount[d] += 1;
    return { ...q, diagnosis: d };
  });

  let dominant: Diagnosis = "paham";
  if (diagnosticsCount.miskonsepsi > 0) {
    dominant = "miskonsepsi";
  } else if (diagnosticsCount.tidak_paham > diagnosticsCount.paham) {
    dominant = "tidak_paham";
  } else if (diagnosticsCount.lucky_guess > diagnosticsCount.paham) {
    dominant = "lucky_guess";
  }

  const score = calculateTier1Score(
    fullQuestions.map((q) => ({ answer: q.studentAnswer, correctOption: q.correctOption })),
    fullQuestions.length,
  );

  const initials = student.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    studentId: student.id,
    fullName: student.fullName,
    initials,
    grade: student.grade,
    attemptId: student.attemptId,
    submittedAt: student.submittedAt,
    score,
    diagnosticsCount,
    dominantDiagnosis: dominant,
    questions: fullQuestions,
  };
}

function buildPack(
  packMeta: {
    id: string;
    title: string;
    indicator: string;
    subject: string;
    grade: string;
    totalStudents: number;
    published?: boolean;
  },
  students: StudentPackResult[]
): TeacherTestPack {
  const diagnosticsCount: DiagnosticCount = { paham: 0, miskonsepsi: 0, lucky_guess: 0, tidak_paham: 0 };
  for (const s of students) {
    diagnosticsCount.paham += s.diagnosticsCount.paham;
    diagnosticsCount.miskonsepsi += s.diagnosticsCount.miskonsepsi;
    diagnosticsCount.lucky_guess += s.diagnosticsCount.lucky_guess;
    diagnosticsCount.tidak_paham += s.diagnosticsCount.tidak_paham;
  }
  const questionCount = students[0]?.questions.length || 0;

  return {
    ...packMeta,
    published: packMeta.published ?? true,
    questionCount,
    studentAttemptCount: students.length,
    diagnosticsCount,
    students,
  };
}

// =========================================================================
// PACK 1: FISIKA (Hukum II & III Newton pada Gerak Benda - 6 Soal)
// =========================================================================

const FISIKA_QUESTIONS = [
  {
    questionId: "fis-q1",
    position: 1,
    stem: "Balok bermassa 4 kg didorong dengan gaya tetap 12 N pada lantai licin. Bagaimana keadaan percepatannya?",
    options: [
      "Percepatan konstan sebesar 3 m/s²",
      "Percepatan makin besar seiring bertambahnya waktu",
      "Kecepatan balok bernilai nol",
      "Percepatan berkurang karena inersia",
    ],
    reasons: [
      "Gaya konstan menghasilkan percepatan konstan sesuai a = F/m",
      "Gaya yang terus bekerja membuat percepatan terus bertambah",
      "Lantai licin menghilangkan gaya dorong",
      "Massa benda menghambat percepatan sehingga melambat",
    ],
    correctOption: 0,
    correctReason: 0,
    explanation: "Sesuai Hukum II Newton, percepatan berbanding lurus dengan gaya konstan (a = F/m). Karena F = 12 N dan m = 4 kg, percepatan benda adalah konstan 3 m/s² sepanjang gaya terus bekerja.",
  },
  {
    questionId: "fis-q2",
    position: 2,
    stem: "Dua benda dengan massa berbeda (1 kg dan 5 kg) dijatuhkan bersamaan dari menara setinggi 20 m tanpa hambatan udara. Benda mana yang mendarat lebih dulu?",
    options: [
      "Benda 5 kg mendarat lebih dulu",
      "Keduanya mendarat bersamaan",
      "Benda 1 kg mendarat lebih dulu",
      "Tergantung pada volume benda",
    ],
    reasons: [
      "Benda yang lebih berat ditarik gravitasi lebih kuat sehingga jatuh lebih cepat",
      "Percepatan gravitasi sama untuk semua benda tanpa memandang massa (g = 9.8 m/s²)",
      "Benda ringan memiliki hambatan udara lebih kecil",
      "Benda berat memiliki energi kinetik lebih kecil",
    ],
    correctOption: 1,
    correctReason: 1,
    explanation: "Dalam ruang tanpa hambatan udara, semua benda mengalami percepatan jatuh bebas yang sama (g ≈ 9.8 m/s²) terlepas dari massa maupun ukuran benda, sehingga mendarat secara bersamaan.",
  },
  {
    questionId: "fis-q3",
    position: 3,
    stem: "Gaya dorong F pada sebuah balok bermassa m diperbesar menjadi 2F. Bagaimana perubahan percepatannya jika gesekan diabaikan?",
    options: [
      "Percepatan menjadi 2 kali lipat dari semula",
      "Percepatan menjadi 4 kali lipat dari semula",
      "Percepatan tetap sama",
      "Percepatan berkurang menjadi setengahnya",
    ],
    reasons: [
      "Percepatan berbanding lurus dengan resultan gaya (a ∝ F)",
      "Percepatan berbanding terbalik dengan kuadrat gaya",
      "Massa benda tetap sehingga percepatan tidak terpengaruh",
      "Gaya aksi menimbulkan gaya reaksi yang meredam percepatan",
    ],
    correctOption: 0,
    correctReason: 0,
    explanation: "Menurut Hukum II Newton (a = F/m), percepatan berbanding lurus dengan resultan gaya. Ketika gaya dorong digandakan menjadi 2F dengan massa tetap m, percepatannya berlipat ganda menjadi dua kali lipat.",
  },
  {
    questionId: "fis-q4",
    position: 4,
    stem: "Sebuah bus direm mendadak dan tubuh penumpang terdorong ke depan. Mengapa hal tersebut terjadi?",
    options: [
      "Ada gaya dorong rem yang mendorong penumpang ke depan",
      "Tubuh penumpang cenderung mempertahankan keadaan geraknya (kelembaman)",
      "Gaya gravitasi bumi tiba-tiba berkurang saat pengereman",
      "Gaya gesek ban berpindah ke lantai bus",
    ],
    reasons: [
      "Gaya pengereman menghasilkan gaya reaksi ke arah depan bus",
      "Hukum I Newton menyatakan benda bergerak cenderung terus bergerak lurus beraturan",
      "Gaya sentrifugal mendorong semua objek ke arah depan",
      "Massa penumpang menolak gaya gesek lantai",
    ],
    correctOption: 1,
    correctReason: 1,
    explanation: "Berdasarkan Hukum I Newton (Kelembaman), benda yang sedang bergerak cenderung mempertahankan kecepatan dan arah geraknya. Ketika bus mendadak direm, tubuh penumpang terus bergerak maju karena kelembaman.",
  },
  {
    questionId: "fis-q5",
    position: 5,
    stem: "Benda bergerak lurus beraturan (GLB) dengan kecepatan konstan 10 m/s. Berapakah resultan gaya total yang bekerja pada benda?",
    options: [
      "Resultan gaya sama dengan nol",
      "Resultan gaya sebesar 10 Newton",
      "Resultan gaya positif sebanding massa benda",
      "Resultan gaya tak hingga",
    ],
    reasons: [
      "Sesuai Hukum I Newton, kecepatan konstan berarti tidak ada percepatan (ΣF = 0)",
      "Dibutuhkan gaya konstan agar benda tetap bisa mempertahankan kecepatannya",
      "Gaya dorong harus selalu lebih besar dari nol agar tidak berhenti",
      "Energi kinetik membutuhkan resultan gaya konstan",
    ],
    correctOption: 0,
    correctReason: 0,
    explanation: "Pada gerak lurus beraturan (kecepatan konstan), percepatan adalah nol (a = 0). Menurut Hukum I Newton, resultan gaya total yang bekerja pada benda harus sama dengan nol (ΣF = 0).",
  },
  {
    questionId: "fis-q6",
    position: 6,
    stem: "Sebuah buku diletakkan diam di atas meja. Manakah pernyataan yang benar mengenai pasangan gaya aksi-reaksi Hukum III Newton?",
    options: [
      "Gaya berat buku dan gaya normal meja pada buku",
      "Gaya tekan buku pada meja dan gaya normal meja pada buku",
      "Gaya gravitasi bumi pada buku dan gaya normal meja pada buku",
      "Gaya gesek meja dan gaya berat buku",
    ],
    reasons: [
      "Gaya aksi-reaksi bekerja pada dua benda berbeda dan berlawanan arah",
      "Kedua gaya saling meniadakan karena berada pada benda yang sama sehingga diam",
      "Gaya normal adalah akibat langsung dari gravitasi bumi",
      "Gaya aksi dan reaksi selalu berada pada satu titik tangkap",
    ],
    correctOption: 1,
    correctReason: 0,
    explanation: "Hukum III Newton menetapkan bahwa pasangan aksi-reaksi selalu bekerja pada dua benda yang berbeda. Buku menekan meja (aksi), dan meja menekan buku ke atas dengan gaya normal (reaksi).",
  },
];

// Pack 1 Students:
// 1. Rani: 4/6 correct (Q1, Q3, Q5, Q6) -> Score: 67
const raniPack1 = buildStudentResult(
  { id: "std-01", fullName: "Rani Putri", grade: "Kelas X-A", attemptId: "att-01", submittedAt: "18 Sep 2026, 14:20" },
  [
    { ...FISIKA_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[1], studentAnswer: 0, studentReason: 0, confident: true },   // Miskonsepsi (✗)
    { ...FISIKA_QUESTIONS[2], studentAnswer: 0, studentReason: 0, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[3], studentAnswer: 0, studentReason: 0, confident: true },   // Miskonsepsi (✗)
    { ...FISIKA_QUESTIONS[4], studentAnswer: 0, studentReason: 0, confident: false },  // Lucky Guess (✓)
    { ...FISIKA_QUESTIONS[5], studentAnswer: 1, studentReason: 0, confident: true },   // Paham (✓)
  ]
);

// 2. Budi: 4/6 correct (Q1, Q3, Q4, Q5) -> Score: 67
const budiPack1 = buildStudentResult(
  { id: "std-02", fullName: "Budi Santoso", grade: "Kelas X-A", attemptId: "att-02", submittedAt: "18 Sep 2026, 14:45" },
  [
    { ...FISIKA_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[1], studentAnswer: 0, studentReason: 0, confident: true },   // Miskonsepsi (✗)
    { ...FISIKA_QUESTIONS[2], studentAnswer: 0, studentReason: 0, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[3], studentAnswer: 1, studentReason: 1, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[4], studentAnswer: 0, studentReason: 0, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[5], studentAnswer: 0, studentReason: 1, confident: true },   // Miskonsepsi (✗)
  ]
);

// 3. Siti: 6/6 correct -> Score: 100
const sitiPack1 = buildStudentResult(
  { id: "std-03", fullName: "Siti Rahma", grade: "Kelas X-B", attemptId: "att-03", submittedAt: "18 Sep 2026, 15:10" },
  [
    { ...FISIKA_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[1], studentAnswer: 1, studentReason: 1, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[2], studentAnswer: 0, studentReason: 0, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[3], studentAnswer: 1, studentReason: 1, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[4], studentAnswer: 0, studentReason: 0, confident: true },   // Paham (✓)
    { ...FISIKA_QUESTIONS[5], studentAnswer: 1, studentReason: 0, confident: true },   // Paham (✓)
  ]
);

// 4. Dimas: 1/6 correct (Q5) -> Score: 17
const dimasPack1 = buildStudentResult(
  { id: "std-04", fullName: "Dimas Pratama", grade: "Kelas X-B", attemptId: "att-04", submittedAt: "18 Sep 2026, 16:05" },
  [
    { ...FISIKA_QUESTIONS[0], studentAnswer: 1, studentReason: 1, confident: true },   // Miskonsepsi (✗)
    { ...FISIKA_QUESTIONS[1], studentAnswer: 0, studentReason: 0, confident: true },   // Miskonsepsi (✗)
    { ...FISIKA_QUESTIONS[2], studentAnswer: 2, studentReason: 2, confident: false },  // Tidak Paham (✗)
    { ...FISIKA_QUESTIONS[3], studentAnswer: 0, studentReason: 0, confident: true },   // Miskonsepsi (✗)
    { ...FISIKA_QUESTIONS[4], studentAnswer: 0, studentReason: 0, confident: false },  // Lucky Guess (✓)
    { ...FISIKA_QUESTIONS[5], studentAnswer: 3, studentReason: 3, confident: false },  // Tidak Paham (✗)
  ]
);

const PACK_1 = buildPack(
  {
    id: "mock-pack-1",
    title: "Hukum II & III Newton pada Gerak Benda",
    indicator: "Menganalisis hubungan antara gaya, massa, dan percepatan pada gerak lurus serta aksi-reaksi benda.",
    subject: "Fisika",
    grade: "Kelas 10",
    totalStudents: 28,
    published: true,
  },
  [raniPack1, budiPack1, sitiPack1, dimasPack1]
);

// =========================================================================
// PACK 2: BIOLOGI (Fotosintesis dan Pertukaran Gas pada Tumbuhan - 5 Soal)
// =========================================================================

const BIOLOGI_QUESTIONS = [
  {
    questionId: "bio-q1",
    position: 1,
    stem: "Pada organel kloroplas, di manakah berlangsungnya reaksi terang fotosintesis?",
    options: ["Membran Tilakoid", "Stroma", "Krista", "Matriks"],
    reasons: [
      "Tilakoid mengandung pigmen klorofil yang menyerap foton cahaya",
      "Stroma mengandung enzim Rubisco untuk fiksasi karbon",
      "Krista adalah lipatan membran mitokondria",
      "Matriks tempat siklus Krebs",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "bio-q2",
    position: 2,
    stem: "Gas oksigen (O₂) yang dihasilkan dari fotosintesis berasal dari pemecahan molekul apa?",
    options: [
      "Pemecahan air (H₂O) melalui fotolisis",
      "Penguraian karbon dioksida (CO₂)",
      "Penguraian molekul glukosa",
      "Reduksi NADPH",
    ],
    reasons: [
      "Fotolisis air melepaskan elektron, proton, dan gas O₂",
      "Semua oksigen dalam tumbuhan bersumber dari gas CO₂ yang dihirup daun",
      "Glukosa dipecah melepaskan O₂ sebagai sisa",
      "NADPH mendonasikan oksigen ke udara",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "bio-q3",
    position: 3,
    stem: "Apakah reaksi gelap (siklus Calvin) hanya dapat terjadi pada malam hari saat tidak ada cahaya?",
    options: [
      "Tidak, siklus Calvin dapat berlangsung di siang hari asalkan tersedia ATP dan NADPH",
      "Ya, cahaya merusak enzim yang bekerja pada siklus Calvin",
      "Ya, fotosintesis berhenti total saat ada matahari",
      "Tidak, reaksi gelap hanya butuh suhu dingin",
    ],
    reasons: [
      "Siklus Calvin tidak memerlukan foton langsung tetapi bergantung pada produk reaksi terang",
      "Stomata hanya membuka di malam hari untuk reaksi gelap",
      "Enzim Rubisco tidak aktif jika ada foton cahaya",
      "Klorofil terurai di siang hari",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "bio-q4",
    position: 4,
    stem: "Apa peran utama enzim Rubisco dalam siklus Calvin?",
    options: [
      "Memfiksasi CO₂ dan mengikatkannya pada molekul RuBP",
      "Memecah molekul air menghasilkan elektron",
      "Memompa ion hidrogen menembus membran",
      "Menyerap spektrum gelombang cahaya hijau",
    ],
    reasons: [
      "Rubisco mengkatalisis tahap awal pengikatan karbon anorganik menjadi senyawa organik",
      "Rubisco berfungsi sebagai pigmen utama penangkap cahaya matahari",
      "Rubisco menghasilkan ATP secara langsung",
      "Rubisco mengangkut glukosa ke pembuluh floem",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "bio-q5",
    position: 5,
    stem: "Mengapa peningkatan konsentrasi CO₂ pada titik tertentu tidak lagi meningkatkan laju fotosintesis?",
    options: [
      "Faktor pembatas lain (seperti kejenuhan enzim atau cahaya) mulai membatasi laju",
      "Tumbuhan mengalami keracunan karbon dioksida",
      "Klorofil kehilangan kemampuan menyerap foton",
      "Air di dalam stomata habis menguap",
    ],
    reasons: [
      "Hukum faktor pembatas menyatakan laju dibatasi oleh faktor yang paling minimal",
      "Daun menutup semua stomata saat CO₂ terlalu padat",
      "CO₂ berlebih bereaksi menjadi asam yang merusak sel",
      "Tekanan osmosis menghancurkan dinding sel",
    ],
    correctOption: 0,
    correctReason: 0,
  },
];

// Pack 2 Students:
// 1. Rani: 4/5 correct -> Score: 80
const raniPack2 = buildStudentResult(
  { id: "std-01", fullName: "Rani Putri", grade: "Kelas X-A", attemptId: "att-05", submittedAt: "17 Sep 2026, 11:15" },
  [
    { ...BIOLOGI_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...BIOLOGI_QUESTIONS[1], studentAnswer: 1, studentReason: 1, confident: true },  // Miskonsepsi (✗)
    { ...BIOLOGI_QUESTIONS[2], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...BIOLOGI_QUESTIONS[3], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...BIOLOGI_QUESTIONS[4], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
  ]
);

// 2. Budi: 4/5 correct -> Score: 80
const budiPack2 = buildStudentResult(
  { id: "std-02", fullName: "Budi Santoso", grade: "Kelas X-A", attemptId: "att-08", submittedAt: "17 Sep 2026, 13:20" },
  [
    { ...BIOLOGI_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...BIOLOGI_QUESTIONS[1], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...BIOLOGI_QUESTIONS[2], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...BIOLOGI_QUESTIONS[3], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...BIOLOGI_QUESTIONS[4], studentAnswer: 1, studentReason: 1, confident: true },  // Miskonsepsi (✗)
  ]
);

// 3. Dimas: 2/5 correct -> Score: 40
const dimasPack2 = buildStudentResult(
  { id: "std-04", fullName: "Dimas Pratama", grade: "Kelas X-B", attemptId: "att-09", submittedAt: "17 Sep 2026, 14:00" },
  [
    { ...BIOLOGI_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...BIOLOGI_QUESTIONS[1], studentAnswer: 1, studentReason: 1, confident: true },  // Miskonsepsi (✗)
    { ...BIOLOGI_QUESTIONS[2], studentAnswer: 1, studentReason: 1, confident: true },  // Miskonsepsi (✗)
    { ...BIOLOGI_QUESTIONS[3], studentAnswer: 0, studentReason: 0, confident: false }, // Lucky Guess (✓)
    { ...BIOLOGI_QUESTIONS[4], studentAnswer: 2, studentReason: 2, confident: false }, // Tidak Paham (✗)
  ]
);

const PACK_2 = buildPack(
  {
    id: "mock-pack-2",
    title: "Fotosintesis dan Pertukaran Gas pada Tumbuhan",
    indicator: "Membedakan reaksi terang dan siklus Calvin serta faktor pembatas pembentukan glukosa.",
    subject: "Biologi",
    grade: "Kelas 10",
    totalStudents: 28,
    published: true,
  },
  [raniPack2, budiPack2, dimasPack2]
);

// =========================================================================
// PACK 3: KIMIA (Reaksi Asam Basa dan Derajat Keasaman - 4 Soal)
// =========================================================================

const KIMIA_QUESTIONS = [
  {
    questionId: "ch-q1",
    position: 1,
    stem: "Larutan HCl 0.1 M memiliki nilai pH = 1, sedangkan larutan CH₃COOH 0.1 M memiliki pH sekitar 3. Mengapa nilai pH keduanya berbeda meskipun konsentrasinya sama?",
    options: [
      "HCl adalah asam kuat yang terionisasi sempurna (α=1), sedangkan CH₃COOH terionisasi sebagian",
      "HCl memiliki massa molar lebih besar daripada asam cuka",
      "Asam cuka mengandung lebih banyak atom hidrogen daripada HCl",
      "HCl mudah menguap ke udara menghasilkan ion H⁺",
    ],
    reasons: [
      "Kekuatan asam ditentukan oleh derajat ionisasi, bukan konsentrasi awal larutan",
      "Massa jenis asam kuat selalu lebih besar daripada asam lemah",
      "Semakin banyak atom H dalam rumus kimia, larutan semakin asam",
      "Ikatan kovalen polar pada HCl mudah larut dalam air",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "ch-q2",
    position: 2,
    stem: "Apakah larutan dengan pH 2 memiliki keasaman 2 kali lebih kuat dibandingkan larutan dengan pH 4?",
    options: [
      "Tidak, pH 2 memiliki konsentrasi ion H⁺ 100 kali lebih besar daripada pH 4",
      "Ya, selisih 2 skala pH setara dengan 2 kali lipat konsentrasi H⁺",
      "Tidak, pH 2 lebih basa daripada pH 4",
      "Ya, skala pH berbanding lurus secara linier dengan konsentrasi",
    ],
    reasons: [
      "Skala pH adalah fungsi logaritmik basis 10, sehingga selisih 2 skala berarti 10² = 100 kali",
      "Perhitungan skala asam mengikuti perbandingan rasio linier",
      "Semakin kecil pH, semakin kecil konsentrasi ion hidrogen",
      "Tiap penurunan 1 derajat pH melipatgandakan ion OH⁻",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "ch-q3",
    position: 3,
    stem: "Air murni pada suhu 25°C memiliki pH = 7. Apa yang terjadi pada konsentrasi [H⁺] dan [OH⁻] di dalam air murni tersebut?",
    options: [
      "Konsentrasi [H⁺] sama dengan konsentrasi [OH⁻] yaitu 10⁻⁷ M",
      "Air murni tidak memiliki ion H⁺ maupun OH⁻",
      "Konsentrasi [H⁺] lebih besar karena air bersifat polar",
      "Hanya ion H⁺ yang terbentuk melalui autoionisasi",
    ],
    reasons: [
      "Autoionisasi air netral menghasilkan jumlah mol [H⁺] dan [OH⁻] yang setara",
      "Air adalah senyawa kovalen yang tidak pernah terionisasi sama sekali",
      "Molekul air menarik proton lebih cepat daripada melepaskannya",
      "Nilai Kw air selalu bernilai nol pada kondisi murni",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "ch-q4",
    position: 4,
    stem: "Ketika larutan asam kuat dicampur dengan larutan basa kuat dalam jumlah mol ekuivalen yang sama, sifat larutan akhir adalah?",
    options: [
      "Netral (pH = 7)",
      "Sedikit asam karena asam lebih mendominasi",
      "Sedikit basa karena garam terhidrolisis",
      "Tidak dapat ditentukan",
    ],
    reasons: [
      "Reaksi netralisasi menghasilkan garam dari kation basa kuat dan anion asam kuat yang tidak terhidrolisis",
      "Semua garam selalu menghasilkan sifat sedikit asam di dalam air",
      "Anion asam kuat menarik kembali ion H⁺ dari pelarut",
      "Kation basa kuat melepaskan ion OH⁻ bebas",
    ],
    correctOption: 0,
    correctReason: 0,
  },
];

// Pack 3 Students:
// 1. Budi: 3/4 correct -> Score: 75
const budiPack3 = buildStudentResult(
  { id: "std-02", fullName: "Budi Santoso", grade: "Kelas X-A", attemptId: "att-06", submittedAt: "16 Sep 2026, 09:30" },
  [
    { ...KIMIA_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
    { ...KIMIA_QUESTIONS[1], studentAnswer: 1, studentReason: 1, confident: true }, // Miskonsepsi (✗)
    { ...KIMIA_QUESTIONS[2], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
    { ...KIMIA_QUESTIONS[3], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
  ]
);

// 2. Siti: 4/4 correct -> Score: 100
const sitiPack3 = buildStudentResult(
  { id: "std-03", fullName: "Siti Rahma", grade: "Kelas X-B", attemptId: "att-10", submittedAt: "16 Sep 2026, 10:15" },
  [
    { ...KIMIA_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
    { ...KIMIA_QUESTIONS[1], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
    { ...KIMIA_QUESTIONS[2], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
    { ...KIMIA_QUESTIONS[3], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
  ]
);

const PACK_3 = buildPack(
  {
    id: "mock-pack-3",
    title: "Reaksi Asam Basa dan Derajat Keasaman (pH)",
    indicator: "Mengidentifikasi kekuatan asam-basa berdasarkan derajat ionisasi dan perubahan warna indikator.",
    subject: "Kimia",
    grade: "Kelas 10",
    totalStudents: 28,
    published: false,
  },
  [budiPack3, sitiPack3]
);

// =========================================================================
// PACK 4: GEOGRAFI (Siklus Hidrologi dan Pembentukan Awan - 4 Soal)
// =========================================================================

const GEOGRAFI_QUESTIONS = [
  {
    questionId: "geo-q1",
    position: 1,
    stem: "Proses pelepasan uap air ke atmosfer yang berasal dari stomata tumbuhan disebut?",
    options: ["Transpirasi", "Evaporasi", "Sublimasi", "Perkolasi"],
    reasons: [
      "Transpirasi adalah penguapan biologis dari jaringan tumbuhan",
      "Evaporasi hanya berlaku untuk air laut",
      "Sublimasi adalah perubahan gas langsung ke cair",
      "Perkolasi adalah peresapan air ke dalam batuan",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "geo-q2",
    position: 2,
    stem: "Awan terbentuk di atmosfer ketika udara basah mengalami pendinginan hingga mencapai suhu tertentu yang disebut?",
    options: ["Titik Embun (Dew Point)", "Titik Didih", "Titik Beku", "Titik Jenuh Mutlak"],
    reasons: [
      "Pada suhu titik embun, kelembapan relatif mencapai 100% sehingga uap air mengembun menjadi tetes air",
      "Udara dingin membekukan seluruh uap air menjadi es sebelum menjadi awan",
      "Titik didih memecah partikel gas menjadi molekul awan",
      "Kondensasi hanya terjadi bila tekanan udara mendekati nol",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "geo-q3",
    position: 3,
    stem: "Apakah awan terbuat dari uap air murni dalam wujud gas yang tidak terlihat?",
    options: [
      "Tidak, awan terdiri dari kumpulan tetes-tetes air cair atau kristal es yang sangat kecil",
      "Ya, awan adalah uap air gas murni yang berkumpul bersama",
      "Tidak, awan adalah asap debu vulkanik yang mengambang",
      "Ya, gas selalu dapat dilihat jika suhunya dingin",
    ],
    reasons: [
      "Uap air (gas) bersifat transparan tidak kasat mata; yang terlihat sebagai awan adalah air cair hasil kondensasi",
      "Gas di atmosfer menjadi berwarna putih karena pantulan sinar matahari",
      "Udara basah berubah wujud menjadi plasma awan",
      "Kristal es hanya terbentuk di awan cirrus, awan lain adalah uap gas murni",
    ],
    correctOption: 0,
    correctReason: 0,
  },
  {
    questionId: "geo-q4",
    position: 4,
    stem: "Pergerakan air di dalam tanah menuju lapisan air tanah yang lebih dalam (akuifer) dinamakan?",
    options: ["Perkolasi", "Infiltrasi", "Presipitasi", "Intersepsi"],
    reasons: [
      "Perkolasi adalah gerakan aliran air vertikal lebih lanjut setelah infiltrasi di permukaan tanah",
      "Infiltrasi hanya terjadi pada permukaan batuan kedap air",
      "Presipitasi adalah nama lain dari pembentukan air tanah",
      "Intersepsi adalah aliran air hujan di permukaan jalan",
    ],
    correctOption: 0,
    correctReason: 0,
  },
];

// Pack 4 Students:
// 1. Siti: 4/4 correct -> Score: 100
const sitiPack4 = buildStudentResult(
  { id: "std-03", fullName: "Siti Rahma", grade: "Kelas X-B", attemptId: "att-07", submittedAt: "15 Sep 2026, 13:40" },
  [
    { ...GEOGRAFI_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
    { ...GEOGRAFI_QUESTIONS[1], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
    { ...GEOGRAFI_QUESTIONS[2], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
    { ...GEOGRAFI_QUESTIONS[3], studentAnswer: 0, studentReason: 0, confident: true }, // Paham (✓)
  ]
);

// 2. Dimas: 4/4 correct -> Score: 100
const dimasPack4 = buildStudentResult(
  { id: "std-04", fullName: "Dimas Pratama", grade: "Kelas X-B", attemptId: "att-11", submittedAt: "15 Sep 2026, 14:10" },
  [
    { ...GEOGRAFI_QUESTIONS[0], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...GEOGRAFI_QUESTIONS[1], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
    { ...GEOGRAFI_QUESTIONS[2], studentAnswer: 0, studentReason: 0, confident: false }, // Lucky Guess (✓)
    { ...GEOGRAFI_QUESTIONS[3], studentAnswer: 0, studentReason: 0, confident: true },  // Paham (✓)
  ]
);

const PACK_4 = buildPack(
  {
    id: "mock-pack-4",
    title: "Siklus Hidrologi dan Pembentukan Awan",
    indicator: "Menganalisis proses evaporasi, kondensasi, dan presipitasi dalam daur air.",
    subject: "Geografi",
    grade: "Kelas 10",
    totalStudents: 28,
    published: false,
  },
  [sitiPack4, dimasPack4]
);

export const MOCK_TEST_PACKS: TeacherTestPack[] = [PACK_1, PACK_2, PACK_3, PACK_4];

// Global Reconciled Stats Calculation
function calculateCohortStats(packs: TeacherTestPack[], totalCohortStudents: number = 28): TeacherStats {
  const allScores: number[] = [];
  const activeStudentIds = new Set<string>();

  for (const p of packs) {
    for (const s of p.students) {
      allScores.push(s.score);
      activeStudentIds.add(s.studentId);
    }
  }

  const averageScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  // 23 active students in cohort (4 simulated directly, remaining simulated for realistic cohort turnout)
  const activeStudents = 23;
  const participationRate = Math.round((activeStudents / totalCohortStudents) * 100);

  return {
    totalPacks: packs.length,
    averageScore,
    activeStudents,
    totalStudents: totalCohortStudents,
    participationRate,
  };
}

export const MOCK_TEACHER_STATS: TeacherStats = calculateCohortStats(MOCK_TEST_PACKS);

function buildTeacherPackFromDb(
  s: any,
  dbStudents: any[],
  setAttempts: any[],
): {
  pack: TeacherTestPack;
  questionsMeta: ExportQuestionMeta[];
  scores: number[];
  participatingIds: string[];
} {
  const totalCohortStudents = Math.max(dbStudents.length, 1);
  const questions = (((s.questions as any[]) || []).slice()).sort((a: any, b: any) => a.position - b.position);
  const questionsMeta: ExportQuestionMeta[] = questions.map((q: any) => ({
    position: q.position,
    indicator: q.indicator || undefined,
    subtopic: q.subtopic || undefined,
    cognitiveLevel: q.cognitive_level || undefined,
    stem: q.stem,
    correctOption: q.correct_option,
    correctReason: q.correct_reason,
  }));

  const packDiagnostics: DiagnosticCount = { paham: 0, miskonsepsi: 0, lucky_guess: 0, tidak_paham: 0 };
  const students: StudentPackResult[] = [];
  const processedStudentIds = new Set<string>();
  const scores: number[] = [];
  const participatingIds: string[] = [];

  for (const att of setAttempts) {
    const studentProf = dbStudents.find((st: any) => st.id === att.student_id);
    if (!studentProf || processedStudentIds.has(studentProf.id)) continue;
    processedStudentIds.add(studentProf.id);
    participatingIds.push(studentProf.id);

    const studentDiagnostics: DiagnosticCount = { paham: 0, miskonsepsi: 0, lucky_guess: 0, tidak_paham: 0 };
    const studentQuestions: StudentQuestionDetail[] = [];

    for (const q of questions) {
      const resp = ((att.responses as any[]) || []).find((r: any) => r.question_id === q.id);
      const ans = resp?.answer ?? -1;
      const rsn = resp?.reason ?? -1;
      const conf = Boolean(resp?.confident);

      const d = diagnose(
        { answer: ans, reason: rsn, confident: conf },
        { correct_option: q.correct_option, correct_reason: q.correct_reason },
      );
      studentDiagnostics[d]++;
      packDiagnostics[d]++;

      studentQuestions.push({
        questionId: q.id,
        position: q.position,
        stem: q.stem,
        options: q.options as string[],
        reasons: q.reasons as string[],
        studentAnswer: ans,
        correctOption: q.correct_option,
        studentReason: rsn,
        correctReason: q.correct_reason,
        confident: conf,
        diagnosis: d,
        explanation: q.explanation || "",
        indicator: q.indicator || undefined,
        subtopic: q.subtopic || undefined,
        cognitiveLevel: q.cognitive_level || undefined,
      });
    }

    const score = calculateTier1Score(
      studentQuestions.map((q) => ({ answer: q.studentAnswer, correctOption: q.correctOption })),
      questions.length,
    );
    scores.push(score);

    const dominant = (Object.entries(studentDiagnostics).reduce((a, b) => (b[1] > a[1] ? b : a))[0]) as Diagnosis;

    students.push({
      studentId: studentProf.id,
      fullName: studentProf.full_name,
      initials: studentProf.full_name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      grade: studentProf.grade || s.grade || "Kelas 10",
      attemptId: att.id,
      submittedAt: new Date(att.submitted_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      score,
      diagnosticsCount: studentDiagnostics,
      dominantDiagnosis: dominant,
      questions: studentQuestions,
    });
  }

  return {
    pack: {
      id: s.id,
      title: s.title,
      indicator: s.indicator,
      subject: s.subject || "Fisika",
      grade: s.grade || "Kelas 10",
      published: s.published ?? true,
      questionCount: questions.length,
      studentAttemptCount: students.length,
      totalStudents: totalCohortStudents,
      diagnosticsCount: packDiagnostics,
      students,
    },
    questionsMeta,
    scores,
    participatingIds,
  };
}

export async function fetchTeacherData(): Promise<{
  profile: TeacherProfileInfo;
  stats: TeacherStats;
  testPacks: TeacherTestPack[];
}> {
  if (!isSupabaseConfigured()) {
    const publishedPacks = MOCK_TEST_PACKS.filter((p) => p.published !== false);
    return {
      profile: MOCK_TEACHER,
      stats: calculateCohortStats(publishedPacks),
      testPacks: publishedPacks,
    };
  }

  const { supabase, user, profile } = await requireRole("teacher");

  const teacherProfile: TeacherProfileInfo = {
    fullName: profile.full_name,
    initials: profile.full_name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    email: user.email || "teacher@lms.local",
    title: "GURU FISIKA",
  };

  // Fetch real question sets (published only, fallback if 0005 question_indicator columns are pending)
  let setsRes: any = await supabase
    .from("question_sets")
    .select("id, title, indicator, subject, grade, published, created_at, questions(id, position, stem, options, reasons, correct_option, correct_reason, explanation, indicator, subtopic, cognitive_level)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (setsRes.error && isMissingColumnError(setsRes.error)) {
    setsRes = await supabase
      .from("question_sets")
      .select("id, title, indicator, subject, grade, published, created_at, questions(id, position, stem, options, reasons, correct_option, correct_reason, explanation)")
      .eq("published", true)
      .order("created_at", { ascending: false });
  }

  const dbSets: any[] = setsRes.data ?? [];

  // Fetch student profiles (fallback to base columns if 0004 migration is pending)
  let studentsRes: { data: any[] | null; error: any } = await supabase
    .from("profiles")
    .select("id, full_name, role, grade")
    .eq("role", "student");

  if (studentsRes.error && isMissingColumnError(studentsRes.error)) {
    studentsRes = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("role", "student");
  }

  const dbStudents: any[] = studentsRes.data ?? [];
  const totalCohortStudents = Math.max(dbStudents.length, 1);

  // Fetch submitted attempts with responses
  const attemptsRes = await supabase
    .from("attempts")
    .select("id, set_id, student_id, submitted_at, started_at, responses(question_id, answer, reason, confident)")
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  const dbAttempts: any[] = attemptsRes.data ?? [];

  const testPacks: TeacherTestPack[] = [];
  const allScores: number[] = [];
  const participatingStudents = new Set<string>();

  for (const s of dbSets) {
    const setAttempts = dbAttempts.filter((a: any) => a.set_id === s.id);
    const built = buildTeacherPackFromDb(s, dbStudents, setAttempts);
    built.scores.forEach((sc) => allScores.push(sc));
    built.participatingIds.forEach((id) => participatingStudents.add(id));
    testPacks.push(built.pack);
  }

  const averageScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  const participationRate = Math.round((participatingStudents.size / totalCohortStudents) * 100);

  const stats: TeacherStats = {
    totalPacks: testPacks.length,
    averageScore,
    activeStudents: participatingStudents.size,
    totalStudents: totalCohortStudents,
    participationRate,
  };

  return {
    profile: teacherProfile,
    stats,
    testPacks,
  };
}

export async function fetchTeacherPackById(
  setId: string,
  options?: { includeDrafts?: boolean; supabaseClient?: any },
): Promise<{ pack: TeacherTestPack; questionsMeta: ExportQuestionMeta[] } | null> {
  const includeDrafts = options?.includeDrafts ?? false;

  if (!isSupabaseConfigured()) {
    const pack = MOCK_TEST_PACKS.find((p) => p.id === setId && (includeDrafts || p.published !== false));
    if (!pack) return null;
    const sampleQs = pack.students[0]?.questions ?? [];
    return {
      pack,
      questionsMeta: sampleQs.map((q) => ({
        position: q.position,
        indicator: q.indicator,
        subtopic: q.subtopic,
        cognitiveLevel: q.cognitiveLevel,
        stem: q.stem,
        correctOption: q.correctOption,
        correctReason: q.correctReason,
      })),
    };
  }

  const client = options?.supabaseClient ?? (await requireRole("teacher")).supabase;

  const runSetQuery = (questionCols: string) => {
    let q = client
      .from("question_sets")
      .select(`id, title, indicator, subject, grade, published, created_at, questions(${questionCols})`)
      .eq("id", setId);
    if (!includeDrafts) q = q.eq("published", true);
    return q.maybeSingle();
  };

  let setRes: any = await runSetQuery(
    "id, position, stem, options, reasons, correct_option, correct_reason, explanation, indicator, subtopic, cognitive_level",
  );
  if (setRes.error && isMissingColumnError(setRes.error)) {
    setRes = await runSetQuery(
      "id, position, stem, options, reasons, correct_option, correct_reason, explanation",
    );
  }
  const setRow = setRes.data;
  if (!setRow) return null;

  let [studentsRes, attemptsRes]: [{ data: any[] | null; error: any }, { data: any[] | null; error: any }] = await Promise.all([
    client.from("profiles").select("id, full_name, role, grade").eq("role", "student"),
    client
      .from("attempts")
      .select("id, set_id, student_id, submitted_at, started_at, responses(question_id, answer, reason, confident)")
      .eq("set_id", setId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false }),
  ]);

  if (studentsRes.error && isMissingColumnError(studentsRes.error)) {
    studentsRes = await client
      .from("profiles")
      .select("id, full_name, role")
      .eq("role", "student");
  }

  const built = buildTeacherPackFromDb(
    setRow,
    studentsRes.data ?? [],
    attemptsRes.data ?? [],
  );

  return {
    pack: built.pack,
    questionsMeta: built.questionsMeta,
  };
}