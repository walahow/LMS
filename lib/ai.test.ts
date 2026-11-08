import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { validateQuestions } from "./ai";

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
