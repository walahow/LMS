import "server-only";

/**
 * Single entry point into the AI layer.
 * Calls Gemini (or any OpenAI-compatible endpoint) with structured JSON output.
 */

export type GeneratedQuestion = {
  stem: string;
  options: string[];
  correct_option: number;
  reasons: string[];
  correct_reason: number;
  explanation: string;
};

export type GenerateSetParams = {
  indicator: string;
  subject?: string;
  grade?: string;
  count: number;
  difficulty: "mudah" | "sedang" | "sulit";
};

const SYSTEM_PROMPT = `Anda adalah asisten pembuat soal tes diagnostik tiga tingkat untuk guru di Indonesia.
Setiap butir soal berupa pilihan ganda dengan 4 opsi jawaban (Tier 1) dan 4 opsi alasan (Tier 2).
Tepat satu opsi jawaban benar dan tepat satu opsi alasan benar.
Opsi jawaban dan alasan yang salah harus mencerminkan miskonsepsi umum siswa terhadap indikator yang diberikan, bukan sekadar pengecoh acak.
Sertakan juga explanation (penjelasan konseptual mendalam mengapa opsi jawaban dan alasan tersebut benar secara ilmiah serta meluruskan miskonsepsi yang sering dialami siswa).
Semua teks soal, opsi, alasan, dan penjelasan ditulis dalam Bahasa Indonesia yang baku, jelas, dan sesuai jenjang siswa.
Keluarkan seluruh hasil secara murni sesuai skema JSON yang diminta tanpa teks pembuka atau penutup tambahan.`;

function buildPrompt({ indicator, subject, grade, count, difficulty }: GenerateSetParams) {
  const lines = [
    `Indikator capaian pembelajaran: ${indicator}`,
    subject ? `Mata pelajaran: ${subject}` : null,
    grade ? `Jenjang/kelas target: ${grade}` : null,
    `Tingkat kesulitan: ${difficulty}`,
    `Jumlah soal yang harus dibuat: ${count}`,
    `Format setiap soal: wajib memiliki 4 opsi jawaban (indeks kunci 0..3), 4 opsi alasan (indeks kunci 0..3), dan 1 penjelasan konsep (explanation).`,
  ].filter(Boolean);

  return lines.join("\n");
}

const questionSchema = {
  type: "object",
  properties: {
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
  required: ["stem", "options", "correct_option", "reasons", "correct_reason", "explanation"],
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

/** Validates and cleans raw questions from AI response */
export function validateQuestions(questions: unknown, targetCount: number): GeneratedQuestion[] {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Layanan AI tidak mengembalikan format daftar soal yang sesuai.");
  }

  // Take up to target count if AI returned more
  const items = questions.slice(0, targetCount);

  return items.map((raw, index) => {
    const q = raw as Partial<GeneratedQuestion>;
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

    return {
      stem: q.stem.trim(),
      options: q.options.map((o) => o.trim()),
      correct_option: correctOption,
      reasons: q.reasons.map((r) => r.trim()),
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

  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const requestBody = JSON.stringify({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(params) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "question_set",
        strict: true,
        schema: rootSchema,
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

  // Shuffle options and reasons so the correct answer isn't perpetually in option A (index 0)
  return validateQuestions(parsed.questions, params.count).map(shuffleQuestion);
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
