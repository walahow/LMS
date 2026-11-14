import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  mergeAndValidateTier2Only,
  shuffleReasonsOnly,
  validateQuestions,
} from "./ai";
import { parseBulkKisiKisiText, parseBulkTier1Text, type Tier1InputItem } from "./tier1-parser";

describe("validateQuestions", () => {
  it("successfully validates and normalizes properly formatted questions", () => {
    const raw = [
      {
        stem: "Apa hukum gerak Newton pertama?",
        options: ["Inersia", "F=ma", "Aksi-reaksi", "Gravitasi"],
        correct_option: 0,
        reasons: [
          "Benda mempertahankan keadaan diam atau gerak lurus beraturan",
          "Percepatan sebanding dengan gaya",
          "Ada gaya timbal balik",
          "Massa saling tarik menarik",
        ],
        correct_reason: 0,
      },
    ];

    const result = validateQuestions(raw, 1);
    expect(result).toHaveLength(1);
    expect(result[0].stem).toBe("Apa hukum gerak Newton pertama?");
    expect(result[0].correct_option).toBe(0);
    expect(result[0].correct_reason).toBe(0);
    expect(result[0].options).toHaveLength(4);
    expect(result[0].reasons).toHaveLength(4);
    expect(result[0].explanation).toBeDefined();
  });

  it("throws an error when questions array is empty or invalid", () => {
    expect(() => validateQuestions([], 1)).toThrow();
    expect(() => validateQuestions(null, 1)).toThrow();
  });

  it("throws an error when stem is empty", () => {
    const raw = [
      {
        stem: "   ",
        options: ["A", "B"],
        correct_option: 0,
        reasons: ["R1", "R2"],
        correct_reason: 0,
      },
    ];
    expect(() => validateQuestions(raw, 1)).toThrow("teks pernyataan soal tidak boleh kosong");
  });

  it("falls back to index 0 if correct_option or correct_reason is out of bounds", () => {
    const raw = [
      {
        stem: "Soal uji batas",
        options: ["A", "B", "C", "D"],
        correct_option: 99,
        reasons: ["R1", "R2", "R3", "R4"],
        correct_reason: -1,
      },
    ];
    const result = validateQuestions(raw, 1);
    expect(result[0].correct_option).toBe(0);
    expect(result[0].correct_reason).toBe(0);
  });
});

describe("tier2_only merge & bulk parser", () => {
  it("preserves admin Tier-1 stem, options, and key verbatim when merging Tier 2", () => {
    const tier1: Tier1InputItem[] = [
      {
        stem: "Jika gaya dorong digandakan menjadi 2F, maka percepatan menjadi?",
        options: ["Tetap sama", "Dua kali lipat", "Setengahnya", "Nol"],
        correct_option: 1,
      },
    ];

    const merged = mergeAndValidateTier2Only(tier1, [
      {
        reasons: [
          "Percepatan berbanding lurus dengan resultan gaya (a = F/m)",
          "Massa benda ikut berlipat ganda",
          "Lantai menahan separuh gaya dorong",
          "Percepatan selalu konstan untuk semua gaya",
        ],
        correct_reason: 0,
        explanation: "Sesuai Hukum II Newton, a = F/m.",
      },
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].stem).toBe(tier1[0].stem);
    expect(merged[0].options).toEqual(tier1[0].options);
    expect(merged[0].correct_option).toBe(1);
    expect(merged[0].reasons).toHaveLength(4);
    expect(merged[0].explanation).toBe("Sesuai Hukum II Newton, a = F/m.");

    const shuffled = shuffleReasonsOnly(merged[0]);
    expect(shuffled.options).toEqual(tier1[0].options);
    expect(shuffled.correct_option).toBe(1);
    expect(shuffled.reasons[shuffled.correct_reason]).toBe(
      "Percepatan berbanding lurus dengan resultan gaya (a = F/m)",
    );
  });

  it("parses bulk pasted MCQ text with Kunci line and * marker", () => {
    const sample = `
1. Satuan SI untuk gaya adalah...
A. Joule
B. Newton
C. Watt
D. Pascal
Kunci: B

2. Benda yang diam memiliki resultan gaya sebesar...
A) *Nol
B) 10 N
C) 100 N
D) Tak hingga
    `;

    const parsed = parseBulkTier1Text(sample);
    expect(parsed.error).toBeUndefined();
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[0].correct_option).toBe(1);
    expect(parsed.items[0].options[1]).toBe("Newton");
    expect(parsed.items[1].correct_option).toBe(0);
    expect(parsed.items[1].options[0]).toBe("Nol");
  });

  it("returns helpful error when bulk text misses an option", () => {
    const parsed = parseBulkTier1Text("1. Contoh\nA. Satu\nB. Dua");
    expect(parsed.items).toHaveLength(0);
    expect(parsed.error).toContain("4 opsi jawaban");
  });

  it("supports 5 Tier-1 options (A-E) and per-question metadata in bulk paste & merge", () => {
    const sample = `
1. Sebuah pipa menyempit dialiri air secara tunak. Kelajuan air di bagian sempit adalah...
Indikator: Menerapkan persamaan kontinuitas pada penampang berbeda
Submateri: Persamaan Kontinuitas
Level: C3
A. Lebih kecil
B. Sama besar
C. Nol
D. Tetap konstan
E. *Lebih besar
    `;

    const parsed = parseBulkTier1Text(sample);
    expect(parsed.error).toBeUndefined();
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].indicator).toBe(
      "Menerapkan persamaan kontinuitas pada penampang berbeda",
    );
    expect(parsed.items[0].subtopic).toBe("Persamaan Kontinuitas");
    expect(parsed.items[0].cognitive_level).toBe("C3");
    expect(parsed.items[0].options).toHaveLength(5);
    expect(parsed.items[0].correct_option).toBe(4);

    const merged = mergeAndValidateTier2Only(parsed.items, [
      {
        indicator: "Indikator dari AI",
        reasons: ["A1B1 = A2B2", "Debit berbanding terbalik luas", "Tekanan nol", "Massa jenis berubah"],
        correct_reason: 0,
        explanation: "Debit Q = A·v konstan sehingga kelajuan meningkat saat luas mengecil.",
      },
    ]);

    expect(merged[0].indicator).toBe("Menerapkan persamaan kontinuitas pada penampang berbeda");
    expect(merged[0].subtopic).toBe("Persamaan Kontinuitas");
    expect(merged[0].cognitive_level).toBe("C3");
    expect(merged[0].options).toHaveLength(5);
    expect(merged[0].correct_option).toBe(4);
  });

  it("parses bulk kisi-kisi lines and attaches them in validateQuestions", () => {
    const kisi = parseBulkKisiKisiText(
      "1. Menganalisis Hukum I Newton | Hukum I Newton | C4\n2. Menghitung percepatan | Hukum II Newton | C3",
    );
    expect(kisi.error).toBeUndefined();
    expect(kisi.items).toHaveLength(2);
    expect(kisi.items[0]).toEqual({
      indicator: "Menganalisis Hukum I Newton",
      subtopic: "Hukum I Newton",
      cognitive_level: "C4",
    });

    const validated = validateQuestions(
      [
        {
          indicator: "",
          stem: "Contoh soal 1",
          options: ["A", "B", "C", "D", "E"],
          correct_option: 4,
          reasons: ["R1", "R2", "R3", "R4"],
          correct_reason: 0,
        },
      ],
      1,
      kisi.items,
    );

    expect(validated[0].indicator).toBe("Menganalisis Hukum I Newton");
    expect(validated[0].subtopic).toBe("Hukum I Newton");
    expect(validated[0].cognitive_level).toBe("C4");
    expect(validated[0].correct_option).toBe(4);
  });
});
