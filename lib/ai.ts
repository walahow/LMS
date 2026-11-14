import "server-only";
import type { KisiKisiInputItem, Tier1InputItem } from "@/lib/tier1-parser";

export type { KisiKisiInputItem, Tier1InputItem };

/**
 * Single entry point into the AI layer.
 * Calls Gemini (or any OpenAI-compatible endpoint) with structured JSON output.
 */

export type GenerateMode = "full" | "tier2_only";

export type GeneratedQuestion = {
  indicator: string;
  subtopic?: string;
  cognitive_level?: string;
  stem: string;
  options: string[];
  correct_option: number;
  reasons: string[];
  correct_reason: number;
  explanation: string;
};

export type GenerateSetParams = {
  mode?: GenerateMode;
  indicator: string;
  subject?: string;
  grade?: string;
  count: number;
  difficulty?: "mudah" | "sedang" | "sulit";
  tier1OptionCount?: 4 | 5;
  kisiKisiItems?: KisiKisiInputItem[];
  tier1Questions?: Tier1InputItem[];
};

const SYSTEM_PROMPT = `Anda adalah asisten pembuat soal tes diagnostik tiga tingkat (three-tier diagnostic test) untuk guru di Indonesia.
Pada instrumen tes diagnostik Indonesia, SETIAP NOMOR SOAL memiliki:
- indicator (Indikator Soal spesifik untuk butir soal tersebut)
- subtopic (Submateri spesifik butir soal tersebut)
- cognitive_level (Level kognitif Taksonomi Bloom, misal C3, C4, atau C5)
- stem (Pertanyaan Tier 1 yang mengukur indikator tersebut secara tepat, dapat berupa narasi kasus, data, atau fenomena)
- options (4 atau 5 opsi jawaban Tier 1 sesuai jumlah yang diminta, tepat satu benar dengan indeks correct_option)
- reasons (4 opsi alasan ilmiah Tier 2, tepat satu benar dengan indeks correct_reason)
- explanation (Penjelasan konseptual mendalam mengapa kunci jawaban dan alasan benar saling terhubung, serta meluruskan miskonsepsi pada pengecoh).

Panduan pengaruh Level Kognitif terhadap isi & tingkat kedalaman soal (kalibrasi standar instrumen tes diagnostik SMA di Indonesia):
- C1 (Mengingat): Menguji ketepatan definisi, hukum dasar, atau fakta konsep.
- C2 (Memahami): Menguji pemahaman makna konsep, contoh/non-contoh, atau interpretasi fenomena sehari-hari.
- C3 (Menerapkan): Wajib menyajikan situasi kuantitatif atau penerapan hukum/rumus secara langsung untuk menentukan hasil.
- C4 (Menganalisis): Wajib menyajikan narasi fenomena, perbandingan dua kondisi, data tabel/grafik, atau kasus sebab-akibat yang menuntut analisis konseptual (bukan sekadar hafalan).
- C5 (Mengevaluasi): Meminta siswa menilai/membuktikan kebenaran suatu klaim, hipotesis, atau argumen fisis beserta landasan konsepnya.
- C6 (Mencipta): Meminta siswa merancang solusi, prediksi desain, atau modifikasi percobaan.

Aturan penting:
1. Opsi jawaban salah (Tier 1) dan opsi alasan salah (Tier 2) harus mencerminkan miskonsepsi nyata yang sering dialami siswa, bukan pengecoh asal-asalan.
2. Jika daftar Kisi-Kisi per nomor diberikan, buat TEPAT 1 butir soal untuk setiap nomor sesuai urutan dan ukur persis indikator soal serta kompleksitas cognitive_level pada nomor tersebut. Jika cognitive_level dikosongkan/otomatis, tentukan kode Bloom (C1–C6) yang paling sesuai dengan kata kerja pada indikatornya lalu buat soal setara kedalaman tersebut.
3. Jika hanya diberi 1 topik/capaian umum, pecah topik tersebut menjadi indikator soal spesifik yang berbeda-beda pada setiap nomor soal (1..N), dengan dominasi C3–C4 standar SMA.
4. Semua teks ditulis dalam Bahasa Indonesia yang baku, jelas, ilmiah, dan sesuai jenjang siswa.
5. Keluarkan seluruh hasil secara murni sesuai skema JSON tanpa teks tambahan.`;

const SYSTEM_PROMPT_TIER2_ONLY = `Anda adalah asisten pembuat soal tes diagnostik tiga tingkat untuk guru di Indonesia.
Admin atau guru SUDAH menyediakan soal Tier 1 per nomor (4 atau 5 opsi jawaban A-D / A-E beserta kunci jawabannya, dan bisa juga menyertakan indikator soal, submateri, serta level kognitif).
Tugas Anda HANYA melengkapi setiap nomor soal dengan:
1. indicator: gunakan indikator soal yang diberikan admin jika ada; jika admin belum mengisi indikator pada nomor tersebut, rumuskan 1 kalimat indikator soal yang ringkas dan akurat sesuai isi pertanyaan Tier 1 tersebut.
2. subtopic dan cognitive_level: pertahankan nilai dari admin jika ada, atau tentukan kode C1–C6 yang sesuai dengan tuntutan pertanyaan Tier 1 tersebut.
3. reasons: 4 opsi alasan ilmiah (Tier 2) yang kedalaman analisisnya selaras dengan cognitive_level butir soal (standar diagnostik SMA), dengan tepat satu alasan benar (indeks kunci correct_reason 0..3) dan 3 pengecoh alasan yang mencerminkan miskonsepsi umum siswa terkait pertanyaan Tier 1 tersebut.
4. explanation: penjelasan konseptual mendalam mengapa kunci jawaban Tier 1 dan alasan benar Tier 2 saling terhubung secara ilmiah, serta meluruskan miskonsepsi pada pengecoh.
JANGAN mengubah atau mengarang ulang pertanyaan, jumlah opsi, atau kunci jawaban Tier 1. Kembalikan jumlah elemen pada array questions persis sama dan urut sesuai daftar soal Tier 1 yang diberikan.
Semua teks ditulis dalam Bahasa Indonesia yang baku, jelas, dan sesuai jenjang siswa.`;

const LETTERS = ["A", "B", "C", "D", "E"] as const;

function buildPrompt({
  indicator,
  subject,
  grade,
  count,
  tier1OptionCount = 4,
  kisiKisiItems,
}: GenerateSetParams) {
  const optCount = tier1OptionCount === 5 ? 5 : 4;
  const maxOptIdx = optCount - 1;
  const hasKisiKisi = Array.isArray(kisiKisiItems) && kisiKisiItems.length > 0;
  const targetCount = hasKisiKisi ? kisiKisiItems.length : count;

  const lines = [
    indicator.trim() ? `Topik / Capaian Pembelajaran Umum: ${indicator.trim()}` : null,
    subject ? `Mata pelajaran: ${subject}` : null,
    grade ? `Jenjang/kelas target: ${grade}` : null,
    `Standar kedalaman soal: kalibrasi instrumen tes diagnostik SMA/MA (analisis konseptual, fenomena nyata, dan perhitungan bertahap sesuai level kognitif per butir).`,
    `Jumlah soal yang harus dibuat: ${targetCount}`,
    `Format Tier 1: wajib memiliki TEPAT ${optCount} opsi jawaban (${LETTERS.slice(0, optCount).join(", ")}, indeks correct_option 0..${maxOptIdx}).`,
    `Format Tier 2: wajib memiliki TEPAT 4 opsi alasan (A, B, C, D, indeks correct_reason 0..3), plus 1 explanation konseptual.`,
  ].filter(Boolean);

  if (hasKisiKisi) {
    lines.push("");
    lines.push("Daftar Kisi-Kisi Indikator Per Nomor Soal (buat soal sesuai urutan nomor berikut):");
    kisiKisiItems.forEach((item, idx) => {
      const meta = [
        item.subtopic?.trim() ? `Submateri: ${item.subtopic.trim()}` : null,
        item.cognitive_level?.trim()
          ? `Level Kognitif Wajib: ${item.cognitive_level.trim()}`
          : "Level Kognitif: tentukan otomatis sesuai indikator",
      ]
        .filter(Boolean)
        .join(" | ");
      lines.push(
        `Nomor ${idx + 1}: Indikator: ${item.indicator.trim()} (${meta})`,
      );
    });
  } else {
    lines.push(
      `Catatan: Pecah topik umum di atas menjadi ${targetCount} butir soal dengan Indikator Soal, Submateri, dan Level Kognitif (dominan C3/C4) yang spesifik dan berbeda di setiap nomornya.`,
    );
  }

  return lines.join("\n");
}

function buildTier2Prompt({
  indicator,
  subject,
  grade,
  tier1Questions,
}: GenerateSetParams & { tier1Questions: Tier1InputItem[] }) {
  const headerLines = [
    indicator.trim() ? `Topik/paket pembelajaran: ${indicator.trim()}` : null,
    subject ? `Mata pelajaran: ${subject}` : null,
    grade ? `Jenjang/kelas target: ${grade}` : null,
    `Jumlah soal Tier 1 yang harus dilengkapi Tier 2-nya: ${tier1Questions.length}`,
    "",
    "Daftar Soal Tier 1:",
  ].filter((x) => x !== null);

  const itemsText = tier1Questions.map((item, idx) => {
    const opts = item.options
      .map((opt, oIdx) => `  ${LETTERS[oIdx] ?? String(oIdx + 1)}. ${opt}`)
      .join("\n");
    const keyLetter = LETTERS[item.correct_option] ?? "A";
    const metaLines = [
      item.indicator?.trim() ? `Indikator Soal: ${item.indicator.trim()}` : null,
      item.subtopic?.trim() ? `Submateri: ${item.subtopic.trim()}` : null,
      item.cognitive_level?.trim() ? `Level Kognitif: ${item.cognitive_level.trim()}` : null,
    ].filter(Boolean);
    return [
      `Soal ${idx + 1}:`,
      ...metaLines,
      `Pertanyaan: ${item.stem}`,
      opts,
      `Kunci Jawaban Tier 1: ${keyLetter}`,
    ].join("\n");
  });

  return [...headerLines, ...itemsText].join("\n\n");
}

const questionSchema = {
  type: "object",
  properties: {
    indicator: { type: "string" },
    subtopic: { type: "string" },
    cognitive_level: { type: "string" },
    stem: { type: "string" },
    options: {
      type: "array",
      items: { type: "string" },
    },
    correct_option: { type: "integer" },
    reasons: {
      type: "array",
      items: { type: "string" },
    },
    correct_reason: { type: "integer" },
    explanation: { type: "string" },
  },
  required: [
    "indicator",
    "subtopic",
    "cognitive_level",
    "stem",
    "options",
    "correct_option",
    "reasons",
    "correct_reason",
    "explanation",
  ],
  additionalProperties: false,
};

const rootSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: questionSchema,
    },
  },
  required: ["questions"],
  additionalProperties: false,
};

const tier2OnlyItemSchema = {
  type: "object",
  properties: {
    indicator: { type: "string" },
    subtopic: { type: "string" },
    cognitive_level: { type: "string" },
    reasons: {
      type: "array",
      items: { type: "string" },
    },
    correct_reason: { type: "integer" },
    explanation: { type: "string" },
  },
  required: ["indicator", "subtopic", "cognitive_level", "reasons", "correct_reason", "explanation"],
  additionalProperties: false,
};

const tier2RootSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: tier2OnlyItemSchema,
    },
  },
  required: ["questions"],
  additionalProperties: false,
};

/** Validates and cleans raw questions from AI response */
export function validateQuestions(
  questions: unknown,
  targetCount: number,
  kisiKisiItems?: KisiKisiInputItem[],
): GeneratedQuestion[] {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Layanan AI tidak mengembalikan format daftar soal yang sesuai.");
  }

  // Take up to target count if AI returned more
  const items = questions.slice(0, targetCount);

  return items.map((raw, index) => {
    const q = raw as Partial<GeneratedQuestion>;
    const kisi = kisiKisiItems?.[index];
    const label = `Soal ${index + 1}`;

    if (typeof q.stem !== "string" || !q.stem.trim()) {
      throw new Error(`${label}: teks pernyataan soal tidak boleh kosong.`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2 || !q.options.every((o) => typeof o === "string" && o.trim())) {
      throw new Error(`${label}: opsi jawaban tidak lengkap.`);
    }
    if (!Array.isArray(q.reasons) || q.reasons.length < 2 || !q.reasons.every((r) => typeof r === "string" && r.trim())) {
      throw new Error(`${label}: opsi alasan tidak lengkap.`);
    }

    let correctOption = Number(q.correct_option);
    if (isNaN(correctOption) || correctOption < 0 || correctOption >= q.options.length) {
      correctOption = 0;
    }

    let correctReason = Number(q.correct_reason);
    if (isNaN(correctReason) || correctReason < 0 || correctReason >= q.reasons.length) {
      correctReason = 0;
    }

    const explanation = typeof q.explanation === "string" && q.explanation.trim()
      ? q.explanation.trim()
      : "Kombinasi opsi jawaban dan alasan ini sesuai dengan konsep ilmiah yang benar.";

    const indicator =
      kisi?.indicator?.trim() ||
      (typeof q.indicator === "string" ? q.indicator.trim() : "");
    const subtopic =
      kisi?.subtopic?.trim() ||
      (typeof q.subtopic === "string" && q.subtopic.trim() ? q.subtopic.trim() : undefined);
    const cognitive_level =
      kisi?.cognitive_level?.trim() ||
      (typeof q.cognitive_level === "string" && q.cognitive_level.trim()
        ? q.cognitive_level.trim()
        : undefined);

    return {
      indicator,
      ...(subtopic ? { subtopic } : {}),
      ...(cognitive_level ? { cognitive_level } : {}),
      stem: q.stem.trim(),
      options: q.options.map((o) => o.trim()),
      correct_option: correctOption,
      reasons: q.reasons.map((r) => r.trim()),
      correct_reason: correctReason,
      explanation,
    };
  });
}

/**
 * Merges verbatim admin-supplied Tier-1 items with AI-generated Tier-2 reasons
 * and explanations without altering Tier-1 stems, option texts, or answer keys.
 */
export function mergeAndValidateTier2Only(
  tier1Items: Tier1InputItem[],
  rawTier2: unknown,
): GeneratedQuestion[] {
  if (!Array.isArray(rawTier2) || rawTier2.length < tier1Items.length) {
    throw new Error("Layanan AI tidak mengembalikan alasan Tier 2 untuk seluruh soal yang dimasukkan.");
  }

  return tier1Items.map((t1, index) => {
    const raw = rawTier2[index] as {
      indicator?: unknown;
      subtopic?: unknown;
      cognitive_level?: unknown;
      reasons?: unknown;
      correct_reason?: unknown;
      explanation?: unknown;
    };
    const label = `Soal ${index + 1}`;

    if (
      !Array.isArray(raw?.reasons) ||
      raw.reasons.length < 2 ||
      !raw.reasons.every((r) => typeof r === "string" && r.trim())
    ) {
      throw new Error(`${label}: opsi alasan Tier 2 dari AI tidak lengkap.`);
    }

    let correctReason = Number(raw.correct_reason);
    if (isNaN(correctReason) || correctReason < 0 || correctReason >= raw.reasons.length) {
      correctReason = 0;
    }

    const explanation =
      typeof raw.explanation === "string" && raw.explanation.trim()
        ? raw.explanation.trim()
        : "Alasan tersebut menjelaskan dasar konsep ilmiah dari jawaban yang benar.";

    const indicator =
      t1.indicator?.trim() ||
      (typeof raw.indicator === "string" ? raw.indicator.trim() : "");
    const subtopic =
      t1.subtopic?.trim() ||
      (typeof raw.subtopic === "string" && raw.subtopic.trim() ? raw.subtopic.trim() : undefined);
    const cognitive_level =
      t1.cognitive_level?.trim() ||
      (typeof raw.cognitive_level === "string" && raw.cognitive_level.trim()
        ? raw.cognitive_level.trim()
        : undefined);

    const safeCorrectOption =
      t1.correct_option >= 0 && t1.correct_option < t1.options.length ? t1.correct_option : 0;

    return {
      indicator,
      ...(subtopic ? { subtopic } : {}),
      ...(cognitive_level ? { cognitive_level } : {}),
      stem: t1.stem.trim(),
      options: t1.options.map((o) => o.trim()),
      correct_option: safeCorrectOption,
      reasons: (raw.reasons as string[]).map((r) => r.trim()),
      correct_reason: correctReason,
      explanation,
    };
  });
}

// Auto-retry configuration for 429 (rate-limit) or 503 (temporary high load)
const RETRYABLE_STATUSES = new Set([429, 503]);
const RETRY_DELAYS_MS = [1000, 3000];

export async function generateSet(params: GenerateSetParams): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
  const model = process.env.AI_MODEL || "gemini-1.5-flash";

  if (!apiKey || !apiKey.trim()) {
    throw new Error("CONFIG_MISSING: API Key belum diatur di file .env.local.");
  }

  const mode: GenerateMode = params.mode === "tier2_only" ? "tier2_only" : "full";
  const tier1Questions = params.tier1Questions ?? [];

  if (mode === "tier2_only" && tier1Questions.length === 0) {
    throw new Error("Minimal 1 soal Tier 1 harus diisi untuk membuat alasan Tier 2.");
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const requestBody = JSON.stringify({
    model,
    messages: [
      {
        role: "system",
        content: mode === "tier2_only" ? SYSTEM_PROMPT_TIER2_ONLY : SYSTEM_PROMPT,
      },
      {
        role: "user",
        content:
          mode === "tier2_only"
            ? buildTier2Prompt({ ...params, tier1Questions })
            : buildPrompt(params),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: mode === "tier2_only" ? "tier2_reason_set" : "question_set",
        strict: true,
        schema: mode === "tier2_only" ? tier2RootSchema : rootSchema,
      },
    },
  });

  let response: Response | undefined;
  for (let attempt = 0; ; attempt++) {
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: requestBody,
      });

      if (response.ok) break;

      const isLastAttempt = attempt >= RETRY_DELAYS_MS.length;
      if (!RETRYABLE_STATUSES.has(response.status) || isLastAttempt) {
        const errorText = await response.text().catch(() => "");
        if (response.status === 401 || response.status === 403) {
          throw new Error("AUTH_INVALID: API Key tidak valid atau tidak memiliki akses.");
        }
        if (response.status === 429) {
          throw new Error("RATE_LIMITED: Batas kuota permintaan terlampaui. Silakan coba 1–2 menit lagi.");
        }
        if (response.status === 503) {
          throw new Error("SERVICE_BUSY: Server AI sedang melayani beban tinggi. Silakan coba lagi.");
        }
        throw new Error(`API_ERROR (${response.status}): ${errorText.slice(0, 200)}`);
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    } catch (err: unknown) {
      const isLastAttempt = attempt >= RETRY_DELAYS_MS.length;
      if (err instanceof Error && (err.message.startsWith("AUTH_INVALID") || err.message.startsWith("CONFIG_MISSING"))) {
        throw err;
      }
      if (isLastAttempt) {
        if (err instanceof Error) throw err;
        throw new Error("NETWORK_ERROR: Gagal menghubungi server AI. Periksa koneksi internet Anda.");
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("PARSE_EMPTY: Layanan AI tidak mengembalikan teks jawaban.");
  }

  let parsed: { questions?: unknown };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("PARSE_INVALID: Format respons AI bukan JSON yang valid.");
  }

  if (mode === "tier2_only") {
    // Preserve admin's Tier-1 stems, option ordering, and answer keys verbatim; shuffle Tier-2 reasons only
    return mergeAndValidateTier2Only(tier1Questions, parsed.questions).map(shuffleReasonsOnly);
  }

  // Shuffle options and reasons so the correct answer isn't perpetually in option A (index 0)
  const effectiveCount =
    params.kisiKisiItems && params.kisiKisiItems.length > 0
      ? params.kisiKisiItems.length
      : params.count;
  return validateQuestions(parsed.questions, effectiveCount, params.kisiKisiItems).map(shuffleQuestion);
}

export function shuffleReasonsOnly(question: GeneratedQuestion): GeneratedQuestion {
  const [reasons, correct_reason] = shuffleWithIndex(question.reasons, question.correct_reason);
  return { ...question, reasons, correct_reason };
}

function shuffleQuestion(question: GeneratedQuestion): GeneratedQuestion {
  const [options, correct_option] = shuffleWithIndex(question.options, question.correct_option);
  const [reasons, correct_reason] = shuffleWithIndex(question.reasons, question.correct_reason);
  return { ...question, options, correct_option, reasons, correct_reason };
}

function shuffleWithIndex(items: string[], correctIndex: number): [string[], number] {
  const order = items.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return [order.map((i) => items[i]), order.indexOf(correctIndex)];
}
