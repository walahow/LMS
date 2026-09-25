import { describe, expect, it } from "vitest";
import { diagnose } from "./diagnose";

const q = { correct_option: 1, correct_reason: 2 };

describe("diagnose", () => {
  it("jawaban benar, alasan benar, yakin -> paham", () => {
    expect(diagnose({ answer: 1, reason: 2, confident: true }, q)).toBe("paham");
  });

  it("jawaban benar, alasan benar, tidak yakin -> lucky_guess", () => {
    expect(diagnose({ answer: 1, reason: 2, confident: false }, q)).toBe("lucky_guess");
  });

  it("jawaban benar, alasan salah, yakin -> miskonsepsi", () => {
    expect(diagnose({ answer: 1, reason: 0, confident: true }, q)).toBe("miskonsepsi");
  });

  it("jawaban benar, alasan salah, tidak yakin -> tidak_paham", () => {
    expect(diagnose({ answer: 1, reason: 0, confident: false }, q)).toBe("tidak_paham");
  });

  it("jawaban salah, alasan benar, yakin -> miskonsepsi", () => {
    expect(diagnose({ answer: 0, reason: 2, confident: true }, q)).toBe("miskonsepsi");
  });

  it("jawaban salah, alasan benar, tidak yakin -> tidak_paham", () => {
    expect(diagnose({ answer: 0, reason: 2, confident: false }, q)).toBe("tidak_paham");
  });

  it("jawaban salah, alasan salah, yakin -> miskonsepsi", () => {
    expect(diagnose({ answer: 0, reason: 0, confident: true }, q)).toBe("miskonsepsi");
  });

  it("jawaban salah, alasan salah, tidak yakin -> tidak_paham", () => {
    expect(diagnose({ answer: 0, reason: 0, confident: false }, q)).toBe("tidak_paham");
  });
});
