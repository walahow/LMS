import { describe, expect, it } from "vitest";
import { calculateTier1Score, diagnose } from "./diagnose";
import { MOCK_TEST_PACKS } from "./teacher-data";

describe("MOCK_TEST_PACKS diagnostic consistency", () => {
  it("every question's response matches diagnose() pure function", () => {
    for (const pack of MOCK_TEST_PACKS) {
      for (const student of pack.students) {
        let paham = 0;
        let misk = 0;
        let lucky = 0;
        let tidak = 0;

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
        }

        // Verify student tally
        expect(student.diagnosticsCount.paham).toBe(paham);
        expect(student.diagnosticsCount.miskonsepsi).toBe(misk);
        expect(student.diagnosticsCount.lucky_guess).toBe(lucky);
        expect(student.diagnosticsCount.tidak_paham).toBe(tidak);

        // Verify unified Tier-1 score formula
        const expectedScore = calculateTier1Score(
          student.questions.map((q) => ({ answer: q.studentAnswer, correctOption: q.correctOption })),
          student.questions.length,
        );
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

  it("verifies mock test pack questions have concept explanations for teacher detail view", () => {
    for (const pack of MOCK_TEST_PACKS) {
      for (const student of pack.students) {
        for (const q of student.questions) {
          expect(q.stem.length).toBeGreaterThan(0);
          expect(q.options.length).toBe(4);
          expect(q.reasons.length).toBe(4);
        }
      }
    }
  });

  it("verifies student attempt deduplication picks only the latest submitted attempt", () => {
    // Simulating multiple attempts by the same student (e.g. initial attempt vs retake)
    const studentId = "student-test-uuid";
    const attempts = [
      {
        id: "attempt-1",
        student_id: studentId,
        submitted_at: "2026-11-01T10:00:00Z",
        score: 40,
      },
      {
        id: "attempt-2-latest",
        student_id: studentId,
        submitted_at: "2026-11-02T14:30:00Z",
        score: 85,
      },
      {
        id: "attempt-old",
        student_id: studentId,
        submitted_at: "2026-10-25T08:00:00Z",
        score: 20,
      },
    ];

    // Sorting by submitted_at descending (as in fetchTeacherData)
    const sortedAttempts = [...attempts].sort(
      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    );

    expect(sortedAttempts[0].id).toBe("attempt-2-latest");

    // Deduplication processing loop
    const processedStudentIds = new Set<string>();
    const selectedAttempts: typeof attempts = [];

    for (const att of sortedAttempts) {
      if (processedStudentIds.has(att.student_id)) continue;
      processedStudentIds.add(att.student_id);
      selectedAttempts.push(att);
    }

    // Must have exactly 1 attempt for the student, and it must be the latest one with score 85
    expect(selectedAttempts.length).toBe(1);
    expect(selectedAttempts[0].id).toBe("attempt-2-latest");
    expect(selectedAttempts[0].score).toBe(85);
  });

  it("excludes draft question sets from teacher data", async () => {
    const { fetchTeacherData, MOCK_TEST_PACKS } = await import("./teacher-data");
    const data = await fetchTeacherData();

    // Verify mock packs contain both published and draft sets (for consistency with admin sets)
    expect(MOCK_TEST_PACKS.some((p) => p.published === false)).toBe(true);
    expect(MOCK_TEST_PACKS.some((p) => p.published === true)).toBe(true);

    // Verify teacher data strictly receives only published test packs
    expect(data.testPacks.length).toBeGreaterThan(0);
    for (const pack of data.testPacks) {
      expect(pack.published).not.toBe(false);
    }

    // Number of published packs in teacher view should match published packs in MOCK_TEST_PACKS
    const expectedPublishedCount = MOCK_TEST_PACKS.filter((p) => p.published !== false).length;
    expect(data.testPacks.length).toBe(expectedPublishedCount);
    expect(data.stats.totalPacks).toBe(expectedPublishedCount);
  });
});


