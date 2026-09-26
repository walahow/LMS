import "server-only";

/**
 * Single entry point into the AI layer (docs/PLAN.md §5). Provider is
 * configuration, not code — anything that speaks the OpenAI wire format with
 * `json_schema` structured output works by changing env vars alone.
 */

export type GeneratedQuestion = {
  stem: string;
  options: string[];
  correct_option: number;
  reasons: string[];
  correct_reason: number;
};

export type GenerateSetParams = {
  indicator: string;
  subject?: string;
  grade?: string;
  count: number;
  difficulty: "mudah" | "sedang" | "sulit";
};

const SYSTEM_PROMPT = `Anda adalah asisten pembuat soal tes diagnostik tiga tingkat untuk guru di Indonesia.
Setiap soal berupa pilihan ganda dengan opsi jawaban DAN opsi alasan.
Tepat satu opsi jawaban benar dan tepat satu opsi alasan benar.
Opsi jawaban dan alasan yang salah harus mencerminkan miskonsepsi umum siswa
terhadap indikator yang diberikan, bukan sekadar pengecoh acak.
Semua teks soal, opsi, dan alasan ditulis dalam Bahasa Indonesia yang jelas
dan sesuai jenjang siswa. Jangan menyertakan penjelasan di luar skema JSON
yang diminta.`;

function buildPrompt({ indicator, subject, grade, count, difficulty }: GenerateSetParams) {
  const lines = [
    `Indikator pembelajaran: ${indicator}`,
    subject ? `Mata pelajaran: ${subject}` : null,
    grade ? `Jenjang/kelas: ${grade}` : null,
    `Tingkat kesulitan: ${difficulty}`,
    `Jumlah soal: ${count}`,
    `Setiap soal memiliki 4 opsi jawaban dan 4 opsi alasan.`,
  ].filter(Boolean);

  return lines.join("\n");
}

const questionSchema = {
  type: "object",
  properties: {
    stem: { type: "string" },
    options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
    correct_option: { type: "integer", minimum: 0, maximum: 3 },
    reasons: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
    correct_reason: { type: "integer", minimum: 0, maximum: 3 },
  },
  required: ["stem", "options", "correct_option", "reasons", "correct_reason"],
  additionalProperties: false,
};

function buildSchema(count: number) {
  return {
    type: "object",
    properties: {
      questions: {
        type: "array",
        minItems: count,
        maxItems: count,
        items: questionSchema,
      },
    },
    required: ["questions"],
    additionalProperties: false,
  };
}

/** Throws on any malformed or out-of-range response — callers surface the error, never guess a fix. */
export function validateQuestions(questions: unknown, count: number): GeneratedQuestion[] {
  if (!Array.isArray(questions) || questions.length !== count) {
    const got = Array.isArray(questions) ? questions.length : typeof questions;
    throw new Error(`AI mengembalikan ${got} soal, diharapkan ${count}.`);
  }

  return questions.map((raw, index) => {
    const q = raw as Partial<GeneratedQuestion>;
    const label = `Soal ${index + 1}`;

    if (typeof q.stem !== "string" || !q.stem.trim()) {
      throw new Error(`${label}: teks soal tidak valid.`);
    }
    if (!Array.isArray(q.options) || q.options.length < 2 || !q.options.every((o) => typeof o === "string")) {
      throw new Error(`${label}: opsi jawaban tidak valid.`);
    }
    if (!Array.isArray(q.reasons) || q.reasons.length < 2 || !q.reasons.every((r) => typeof r === "string")) {
      throw new Error(`${label}: opsi alasan tidak valid.`);
    }
    if (
      typeof q.correct_option !== "number" ||
      q.correct_option < 0 ||
      q.correct_option >= q.options.length
    ) {
      throw new Error(`${label}: correct_option di luar jangkauan.`);
    }
    if (
      typeof q.correct_reason !== "number" ||
      q.correct_reason < 0 ||
      q.correct_reason >= q.reasons.length
    ) {
      throw new Error(`${label}: correct_reason di luar jangkauan.`);
    }

    return {
      stem: q.stem,
      options: q.options,
      correct_option: q.correct_option,
      reasons: q.reasons,
      correct_reason: q.correct_reason,
    };
  });
}

// Free-tier Gemini Flash returns 429/503 under load often enough that a
// single failed attempt shouldn't surface as a hard error to the admin.
const RETRYABLE_STATUSES = new Set([429, 503]);
const RETRY_DELAYS_MS = [1000, 3000];

export async function generateSet(params: GenerateSetParams): Promise<GeneratedQuestion[]> {
  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!baseUrl || !apiKey || !model) {
    throw new Error("AI_BASE_URL, AI_API_KEY, dan AI_MODEL harus diatur di environment.");
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
        schema: buildSchema(params.count),
      },
    },
  });

  let response: Response;
  for (let attempt = 0; ; attempt++) {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: requestBody,
    });

    if (response.ok) break;

    const isLastAttempt = attempt === RETRY_DELAYS_MS.length;
    if (!RETRYABLE_STATUSES.has(response.status) || isLastAttempt) {
      const body = await response.text().catch(() => "");
      console.error("[ai] generateSet failed, giving up", {
        attempt: attempt + 1,
        status: response.status,
      });
      throw new Error(`Permintaan AI gagal (${response.status}): ${body.slice(0, 300)}`);
    }
    console.error("[ai] generateSet retrying", {
      attempt: attempt + 1,
      status: response.status,
      retryInMs: RETRY_DELAYS_MS[attempt],
    });
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Respons AI tidak berisi konten yang diharapkan.");
  }

  let parsed: { questions?: unknown };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Respons AI bukan JSON yang valid.");
  }

  return validateQuestions(parsed.questions, params.count);
}
