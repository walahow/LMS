export type Tier1InputItem = {
  indicator?: string;
  subtopic?: string;
  cognitive_level?: string;
  stem: string;
  options: string[]; // 4 or 5 options (A-D or A-E)
  correct_option: number; // 0..options.length - 1
};

export type ManualQuestionInputItem = Tier1InputItem & {
  reasons: string[]; // 4 reasons (A-D)
  correct_reason: number; // 0..3
  explanation?: string;
};

export type KisiKisiInputItem = {
  indicator: string;
  subtopic?: string;
  cognitive_level?: string;
};

export function createEmptyTier1Item(optionCount: 4 | 5 = 4): Tier1InputItem {
  return {
    indicator: "",
    subtopic: "",
    cognitive_level: "",
    stem: "",
    options: Array.from({ length: optionCount }, () => ""),
    correct_option: 0,
  };
}

export function createEmptyManualItem(optionCount: 4 | 5 = 4): ManualQuestionInputItem {
  return {
    ...createEmptyTier1Item(optionCount),
    reasons: ["", "", "", ""],
    correct_reason: 0,
    explanation: "",
  };
}

export const COGNITIVE_LEVEL_OPTIONS = [
  { value: "", label: "Level: Otomatis (AI)" },
  { value: "C1", label: "C1 · Mengingat (Definisi/Fakta)" },
  { value: "C2", label: "C2 · Memahami (Konsep/Prinsip)" },
  { value: "C3", label: "C3 · Menerapkan (Hitung/Rumus)" },
  { value: "C4", label: "C4 · Menganalisis (Kasus/Grafik)" },
  { value: "C5", label: "C5 · Mengevaluasi (Menilai)" },
  { value: "C6", label: "C6 · Mencipta (Merancang)" },
] as const;

export function createEmptyKisiKisiItem(): KisiKisiInputItem {
  return {
    indicator: "",
    subtopic: "",
    cognitive_level: "",
  };
}

const OPTION_LINE_RE = /^(\*?)\s*([A-Ea-e])\s*[.)\]:-]\s*(.+)$/;
const KEY_LINE_RE = /^(?:kunci(?:\s+(?:jawaban|tier\s*1))?|jawaban|key)\s*[:=]\s*([A-Ea-e])\b/i;
const INDICATOR_LINE_RE = /^(?:indikator(?:\s+soal)?)\s*[:=]\s*(.+)$/i;
const SUBTOPIC_LINE_RE = /^(?:submateri|subtopik|topik)\s*[:=]\s*(.+)$/i;
const LEVEL_LINE_RE = /^(?:level(?:\s+kognitif)?|kognitif)\s*[:=]\s*(.+)$/i;
const QUESTION_HEADER_RE = /^(?:soal\s*\d+\s*[:.)-]|\d+\s*[.)])\s*(.*)$/i;

/**
 * Parses bulk kisi-kisi lines pasted by an admin/teacher into per-number items.
 * Supports:
 * - Plain lines: "1. Menganalisis hubungan gaya dan percepatan" (or without numbers)
 * - Pipe or tab delimited: "Menganalisis gaya | Hukum I Newton | C4"
 */
export function parseBulkKisiKisiText(raw: string): {
  items: KisiKisiInputItem[];
  error?: string;
} {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { items: [], error: "Daftar indikator masih kosong." };
  }

  const items: KisiKisiInputItem[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^\d+\s*[.)\-:]\s*/, "").trim();
    if (!cleaned) continue;

    const parts = cleaned.includes("\t")
      ? cleaned.split("\t").map((p) => p.trim())
      : cleaned.includes("|")
        ? cleaned.split("|").map((p) => p.trim())
        : [cleaned];

    const indicator = parts[0] ?? "";
    if (!indicator) continue;

    items.push({
      indicator,
      subtopic: parts[1] || undefined,
      cognitive_level: parts[2] || undefined,
    });
  }

  if (items.length === 0) {
    return { items: [], error: "Tidak ada indikator valid yang terbaca." };
  }

  return { items };
}

/**
 * Parses bulk MCQ text pasted by an admin/teacher into structured Tier-1 items.
 *
 * Supported formats per question block (separated by blank lines or numbered headers):
 *   1. Pertanyaan...
 *   Indikator: ... (opsional)
 *   Submateri: ... (opsional)
 *   Level: C4 (opsional)
 *   A. Opsi satu
 *   B. *Opsi benar (atau pakai baris "Kunci: B")
 *   C. Opsi tiga
 *   D. Opsi empat
 *   E. Opsi lima (opsional)
 *   Kunci: B
 */
export function parseBulkTier1Text(raw: string): {
  items: Tier1InputItem[];
  error?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { items: [], error: "Teks soal masih kosong. Tempel daftar soal Tier 1 terlebih dahulu." };
  }

  const lines = trimmed.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      continue;
    }

    const hasOptionsAlready = current.some((l) => OPTION_LINE_RE.test(l));
    if (hasOptionsAlready && QUESTION_HEADER_RE.test(line)) {
      blocks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    blocks.push(current);
  }

  const items: Tier1InputItem[] = [];

  for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
    const block = blocks[bIdx];
    const stemLines: string[] = [];
    const optMap = new Map<number, string>();
    let detectedKey: number | null = null;
    let indicator: string | undefined;
    let subtopic: string | undefined;
    let cognitive_level: string | undefined;

    for (const line of block) {
      const indMatch = INDICATOR_LINE_RE.exec(line);
      if (indMatch) {
        indicator = indMatch[1].trim();
        continue;
      }

      const subMatch = SUBTOPIC_LINE_RE.exec(line);
      if (subMatch) {
        subtopic = subMatch[1].trim();
        continue;
      }

      const lvlMatch = LEVEL_LINE_RE.exec(line);
      if (lvlMatch) {
        cognitive_level = lvlMatch[1].trim();
        continue;
      }

      const keyMatch = KEY_LINE_RE.exec(line);
      if (keyMatch) {
        detectedKey = keyMatch[1].toUpperCase().charCodeAt(0) - 65;
        continue;
      }

      const optMatch = OPTION_LINE_RE.exec(line);
      if (optMatch) {
        const hasLeadingStar = optMatch[1] === "*";
        const idx = optMatch[2].toUpperCase().charCodeAt(0) - 65;
        let text = optMatch[3].trim();
        const hasTrailingStar = text.endsWith("*");
        if (hasTrailingStar) {
          text = text.slice(0, -1).trim();
        }
        if (text.startsWith("*")) {
          text = text.slice(1).trim();
          detectedKey = idx;
        }
        if (hasLeadingStar || hasTrailingStar) {
          detectedKey = idx;
        }
        optMap.set(idx, text);
        continue;
      }

      if (optMap.size === 0) {
        const qHeader = QUESTION_HEADER_RE.exec(line);
        if (qHeader && stemLines.length === 0) {
          if (qHeader[1].trim()) stemLines.push(qHeader[1].trim());
        } else {
          stemLines.push(line);
        }
      }
    }

    const stem = stemLines.join(" ").trim();
    const hasE = optMap.has(4) && Boolean(optMap.get(4));
    const expectedCount = hasE ? 5 : 4;
    const options = Array.from({ length: expectedCount }, (_, idx) => optMap.get(idx) ?? "");

    if (!stem) {
      return {
        items: [],
        error: `Soal ke-${bIdx + 1} belum memiliki teks pertanyaan.`,
      };
    }
    if (options.slice(0, 4).some((opt) => !opt) || (hasE && !options[4])) {
      return {
        items: [],
        error: `Soal ke-${bIdx + 1} harus memiliki minimal 4 opsi jawaban (A, B, C, D${hasE ? ", E" : ""}).`,
      };
    }

    items.push({
      indicator,
      subtopic,
      cognitive_level,
      stem,
      options,
      correct_option:
        detectedKey !== null && detectedKey >= 0 && detectedKey < options.length
          ? detectedKey
          : 0,
    });
  }

  return { items };
}

const TIER1_SECTION_RE = /^tier\s*1\b.*$/i;
const TIER2_SECTION_RE = /^(?:tier\s*2\b.*|alasan\s*:?\s*)$/i;
const TIER3_SECTION_RE = /^tier\s*3\b.*$/i;
const KEY_TIER1_RE = /^(?:kunci|jawaban)(?:\s+tier\s*1)?\s*[:=]\s*([A-Ea-e])/i;
const KEY_TIER2_RE = /^(?:kunci|jawaban)\s*(?:tier\s*2|alasan)\s*[:=]\s*([A-Da-d])/i;
const EXPLANATION_START_RE = /^(?:pembahasan|penjelasan)\s*[:=]\s*(.*)$/i;

function parseOptionLineWithStar(match: RegExpExecArray) {
  const hasLeadingStar = match[1] === "*";
  const idx = match[2].toUpperCase().charCodeAt(0) - 65;
  let text = match[3].trim();
  let hasStar = hasLeadingStar;
  if (text.endsWith("*")) {
    text = text.slice(0, -1).trim();
    hasStar = true;
  }
  if (text.startsWith("*")) {
    text = text.slice(1).trim();
    hasStar = true;
  }
  return { idx, text, hasStar };
}

export function parseBulkManualText(rawText: string): {
  items: ManualQuestionInputItem[];
  error?: string;
} {
  const normalized = rawText.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return { items: [], error: "Teks masih kosong. Tempel soal Tier 1 & Tier 2 terlebih dahulu." };
  }

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((b) =>
      b
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    )
    .filter((b) => b.length > 0);

  const blocks: string[][] = [];
  for (const b of rawBlocks) {
    const first = b[0] || "";
    const isContinuation =
      blocks.length > 0 &&
      (TIER2_SECTION_RE.test(first) ||
        TIER3_SECTION_RE.test(first) ||
        KEY_TIER1_RE.test(first) ||
        KEY_TIER2_RE.test(first) ||
        EXPLANATION_START_RE.test(first));
    if (isContinuation) {
      blocks[blocks.length - 1].push(...b);
    } else {
      blocks.push([...b]);
    }
  }

  if (blocks.length === 0) {
    return { items: [], error: "Tidak ada blok soal yang terbaca. Pisahkan tiap soal dengan baris kosong." };
  }

  const items: ManualQuestionInputItem[] = [];

  for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
    const block = blocks[bIdx];
    const stemLines: string[] = [];
    const optMap = new Map<number, string>();
    const reasonMap = new Map<number, string>();
    const explanationLines: string[] = [];
    let detectedOptKey: number | null = null;
    let detectedReasonKey: number | null = null;
    let indicator: string | undefined;
    let subtopic: string | undefined;
    let cognitive_level: string | undefined;
    let section: "tier1" | "tier2" | "explanation" | "skip" = "tier1";

    for (const line of block) {
      const indMatch = INDICATOR_LINE_RE.exec(line);
      if (indMatch) {
        indicator = indMatch[1].trim();
        continue;
      }
      const subMatch = SUBTOPIC_LINE_RE.exec(line);
      if (subMatch) {
        subtopic = subMatch[1].trim();
        continue;
      }
      const lvlMatch = LEVEL_LINE_RE.exec(line);
      if (lvlMatch) {
        cognitive_level = lvlMatch[1].trim();
        continue;
      }
      if (TIER1_SECTION_RE.test(line)) {
        section = "tier1";
        continue;
      }
      if (TIER2_SECTION_RE.test(line)) {
        section = "tier2";
        continue;
      }
      if (TIER3_SECTION_RE.test(line)) {
        section = "skip";
        continue;
      }
      const expMatch = EXPLANATION_START_RE.exec(line);
      if (expMatch) {
        section = "explanation";
        if (expMatch[1].trim()) explanationLines.push(expMatch[1].trim());
        continue;
      }
      const k2Match = KEY_TIER2_RE.exec(line);
      if (k2Match) {
        detectedReasonKey = k2Match[1].toUpperCase().charCodeAt(0) - 65;
        continue;
      }
      const k1Match = KEY_TIER1_RE.exec(line);
      if (k1Match) {
        detectedOptKey = k1Match[1].toUpperCase().charCodeAt(0) - 65;
        continue;
      }
      if (section === "explanation") {
        explanationLines.push(line);
        continue;
      }
      if (section === "skip") {
        continue;
      }

      const optMatch = OPTION_LINE_RE.exec(line);
      if (optMatch) {
        const parsed = parseOptionLineWithStar(optMatch);
        if (section === "tier2") {
          if (parsed.idx >= 0 && parsed.idx <= 3) {
            reasonMap.set(parsed.idx, parsed.text);
            if (parsed.hasStar) detectedReasonKey = parsed.idx;
          }
        } else {
          optMap.set(parsed.idx, parsed.text);
          if (parsed.hasStar) detectedOptKey = parsed.idx;
        }
        continue;
      }

      if (section === "tier1" && optMap.size === 0) {
        const qHeader = QUESTION_HEADER_RE.exec(line);
        if (qHeader && stemLines.length === 0) {
          if (qHeader[1].trim()) stemLines.push(qHeader[1].trim());
        } else {
          stemLines.push(line);
        }
      }
    }

    const stem = stemLines.join(" ").trim();
    const hasE = optMap.has(4) && Boolean(optMap.get(4));
    const expectedCount = hasE ? 5 : 4;
    const options = Array.from({ length: expectedCount }, (_, idx) => optMap.get(idx) ?? "");
    const reasons = [0, 1, 2, 3].map((idx) => reasonMap.get(idx) ?? "");

    if (!stem) {
      return {
        items: [],
        error: `Soal ke-${bIdx + 1} belum memiliki teks pertanyaan.`,
      };
    }
    if (options.slice(0, 4).some((o) => !o) || (hasE && !options[4])) {
      return {
        items: [],
        error: `Soal ke-${bIdx + 1} harus memiliki minimal 4 opsi jawaban Tier 1 (A–${hasE ? "E" : "D"}).`,
      };
    }
    if (reasons.some((r) => !r)) {
      return {
        items: [],
        error: `Soal ke-${bIdx + 1} harus memiliki 4 opsi alasan Tier 2 (setelah baris "Alasan:" / "Tier 2", A–D).`,
      };
    }

    items.push({
      indicator,
      subtopic,
      cognitive_level,
      stem,
      options,
      correct_option:
        detectedOptKey !== null && detectedOptKey >= 0 && detectedOptKey < options.length
          ? detectedOptKey
          : 0,
      reasons,
      correct_reason:
        detectedReasonKey !== null && detectedReasonKey >= 0 && detectedReasonKey <= 3
          ? detectedReasonKey
          : 0,
      explanation: explanationLines.join("\n").trim(),
    });
  }

  return { items };
}
