import { describe, expect, it } from "vitest";
import { diagnose } from "./diagnose";
import { MOCK_TEST_PACKS } from "./teacher-data";

describe("MOCK_TEST_PACKS diagnostic consistency", () => {
  it("every question's response matches diagnose() pure function", () => {
    for (const pack of MOCK_TEST_PACKS) {
      for (const student of pack.students) {
        let paham = 0;
        let misk = 0;
        let lucky = 0;
        let tidak = 0;
        let correctCount = 0;

        for (const q of student.questions) {
          const result = diagnose(
            { answer: q.studentAnswer, reason: q.studentReason, confident: q.confident },
            { correct_option: q.correctOption, correct_reason: q.correctReason }
          );

          expect(
            result,
            `Mismatch in pack "${pack.title}", student "${student.fullName}", Q${q.position}`
          ).toBe(q.diagnosis);

          if (result === "paham") paham++;
          if (result === "miskonsepsi") misk++;
          if (result === "lucky_guess") lucky++;
          if (result === "tidak_paham") tidak++;

          if (q.studentAnswer === q.correctOption && q.studentReason === q.correctReason) {
            correctCount++;
          }
        }

        // Verify student tally
        expect(student.diagnosticsCount.paham).toBe(paham);
        expect(student.diagnosticsCount.miskonsepsi).toBe(misk);
        expect(student.diagnosticsCount.lucky_guess).toBe(lucky);
        expect(student.diagnosticsCount.tidak_paham).toBe(tidak);

        // Verify score formula: Math.round((correctCount / totalQuestions) * 100)
        const expectedScore = Math.round((correctCount / student.questions.length) * 100);
        expect(
          student.score,
          `Score mismatch for ${student.fullName} in ${pack.title}: expected ${expectedScore}, got ${student.score}`
        ).toBe(expectedScore);
      }
    }
  });

  it("pack aggregated diagnostic tally matches the sum of its students", () => {
    for (const pack of MOCK_TEST_PACKS) {
      let sumPaham = 0;
      let sumMisk = 0;
      let sumLucky = 0;
      let sumTidak = 0;

      for (const student of pack.students) {
        sumPaham += student.diagnosticsCount.paham;
        sumMisk += student.diagnosticsCount.miskonsepsi;
        sumLucky += student.diagnosticsCount.lucky_guess;
        sumTidak += student.diagnosticsCount.tidak_paham;
      }

      expect(pack.diagnosticsCount.paham).toBe(sumPaham);
      expect(pack.diagnosticsCount.miskonsepsi).toBe(sumMisk);
      expect(pack.diagnosticsCount.lucky_guess).toBe(sumLucky);
      expect(pack.diagnosticsCount.tidak_paham).toBe(sumTidak);
    }
  });
});

describe("Admin mock dataset reconciliation", () => {
  it("reconciles with teacher test packs and cohort counts", async () => {
    const { MOCK_ADMIN_SETS, MOCK_ADMIN_USERS, calculateAdminStats } = await import("./admin-data");

    expect(MOCK_ADMIN_SETS.length).toBe(4);
    expect(MOCK_ADMIN_SETS.filter((s) => s.published).length).toBe(2);
    expect(MOCK_ADMIN_SETS.filter((s) => !s.published).length).toBe(2);

    const stats = calculateAdminStats(MOCK_ADMIN_SETS, MOCK_ADMIN_USERS);
    expect(stats.totalSets).toBe(4);
    expect(stats.publishedSets).toBe(2);
    expect(stats.draftSets).toBe(2);
    expect(stats.totalQuestions).toBe(18);
    expect(stats.totalUsers).toBe(32);
    expect(stats.studentCount).toBe(28);
    expect(stats.teacherCount).toBe(3);
    expect(stats.adminCount).toBe(1);

    // Verify all questions have 4 options and 4 reasons
    for (const set of MOCK_ADMIN_SETS) {
      if (set.questions) {
        expect(set.questions.length).toBe(set.questionCount);
        for (const q of set.questions) {
          expect(q.options.length).toBe(4);
          expect(q.reasons.length).toBe(4);
          expect(q.correctOption).toBeGreaterThanOrEqual(0);
          expect(q.correctOption).toBeLessThanOrEqual(3);
          expect(q.correctReason).toBeGreaterThanOrEqual(0);
          expect(q.correctReason).toBeLessThanOrEqual(3);
        }
      }
    }
  });
});

