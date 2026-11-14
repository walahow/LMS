import { describe, expect, it } from "vitest";
import { parseBulkManualText } from "./tier1-parser";
import { CUSTOMER_QUESTION_PACKS, packToManualItems } from "./customer-packs-data";

describe("parseBulkManualText", () => {
  it("parses compact Tier 1 + Tier 2 + explanation blocks", () => {
    const raw = `
1. Satuan SI untuk gaya adalah ...
Indikator: Mengidentifikasi satuan SI gaya
Submateri: Hukum II Newton
Level: C1
A. Joule
B. Newton
C. Watt
D. Pascal
E. Kelvin
Kunci Tier 1: B
Alasan:
A. Gaya F = m × a bersatuan kg·m/s² atau Newton
B. Joule adalah satuan energi
C. Watt adalah satuan daya
D. Pascal adalah satuan tekanan
Kunci Tier 2: A
Pembahasan: Hukum II Newton mendefinisikan gaya dalam satuan Newton.
    `;

    const res = parseBulkManualText(raw);
    expect(res.error).toBeUndefined();
    expect(res.items).toHaveLength(1);
    const q = res.items[0];
    expect(q.stem).toBe("Satuan SI untuk gaya adalah ...");
    expect(q.indicator).toBe("Mengidentifikasi satuan SI gaya");
    expect(q.subtopic).toBe("Hukum II Newton");
    expect(q.cognitive_level).toBe("C1");
    expect(q.options).toHaveLength(5);
    expect(q.correct_option).toBe(1);
    expect(q.reasons).toHaveLength(4);
    expect(q.correct_reason).toBe(0);
    expect(q.explanation).toContain("Hukum II Newton");
  });

  it("merges Word-style Tier 1 / Tier 2 sections separated by blank lines within one question", () => {
    const raw = `
Tier 1 (Pertanyaan)
Kecepatan air keluar dari keran setinggi 5 m di bawah permukaan adalah ...
A. 5 m/s
B. 10 m/s
C. 15 m/s
D. 20 m/s

Tier 2 (Alasan)
A. Tekanan menentukan kecepatan total
B. v = √(2gh) dengan h kedalaman dari permukaan
C. Massa jenis mempengaruhi v
D. Luas lubang menentukan v

Kunci Tier 1: B
Kunci Tier 2: B

Pembahasan: v = √(2 × 10 × 5) = 10 m/s.
    `;

    const res = parseBulkManualText(raw);
    expect(res.error).toBeUndefined();
    expect(res.items).toHaveLength(1);
    expect(res.items[0].correct_option).toBe(1);
    expect(res.items[0].correct_reason).toBe(1);
    expect(res.items[0].explanation).toContain("10 m/s");
  });

  it("returns helpful error when Tier 2 reasons are missing", () => {
    const raw = `
1. Contoh soal?
A. Satu
B. Dua
C. Tiga
D. Empat
Kunci Tier 1: A
    `;

    const res = parseBulkManualText(raw);
    expect(res.items).toHaveLength(0);
    expect(res.error).toContain("alasan Tier 2");
  });
});

describe("CUSTOMER_QUESTION_PACKS manual mapping", () => {
  it("converts both 20-question packs to valid ManualQuestionInputItem arrays", () => {
    expect(CUSTOMER_QUESTION_PACKS).toHaveLength(2);
    for (const pack of CUSTOMER_QUESTION_PACKS) {
      const manual = packToManualItems(pack);
      expect(manual).toHaveLength(20);
      for (const item of manual) {
        expect(item.options).toHaveLength(5);
        expect(item.reasons).toHaveLength(4);
        expect(item.correct_option).toBeGreaterThanOrEqual(0);
        expect(item.correct_option).toBeLessThan(5);
        expect(item.correct_reason).toBeGreaterThanOrEqual(0);
        expect(item.correct_reason).toBeLessThan(4);
        expect(item.indicator).toBeTruthy();
      }
    }
  });
});
