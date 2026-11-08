import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache
const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}));

// Mock requireRole
const mockInsertAttempt = vi.fn();
const mockInsertResponses = vi.fn();
const mockSelectQuestions = vi.fn();

const mockSupabase = {
  from: (table: string) => {
    if (table === "questions") {
      return {
        select: () => ({
          eq: () => ({
            order: () => mockSelectQuestions(),
          }),
        }),
      };
    }
    if (table === "attempts") {
      return {
        insert: (data: any) => {
          mockInsertAttempt(data);
          return {
            select: () => ({
              single: async () => ({
                data: { id: "attempt-uuid-456" },
                error: null,
              }),
            }),
          };
        },
      };
    }
    if (table === "responses") {
      return {
        insert: async (data: any) => {
          mockInsertResponses(data);
          return { error: null };
        },
      };
    }
    return {};
  },
};

vi.mock("@/lib/auth", () => ({
  requireRole: async () => ({
    supabase: mockSupabase,
    user: { id: "student-uuid-123", email: "student@lms.local" },
    profile: { role: "student", full_name: "Hermione Granger" },
  }),
}));

describe("Student submitFullQuiz Database Persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully persists attempt and 3-tier responses into Supabase tables", async () => {
    mockSelectQuestions.mockResolvedValueOnce({
      data: [
        { id: "q-uuid-1", position: 1, correct_option: 1, correct_reason: 0 },
        { id: "q-uuid-2", position: 2, correct_option: 0, correct_reason: 0 },
      ],
      error: null,
    });

    const { submitFullQuiz } = await import("./actions");

    const answers = {
      1: { answerKey: "B", reasonKey: "A", confident: true },
      2: { answerKey: "C", reasonKey: "B", confident: false },
    };

    const result = await submitFullQuiz({
      setId: "set-uuid-789",
      answers,
    });

    expect(result.success).toBe(true);
    expect(result.attemptId).toBe("attempt-uuid-456");

    // 1. Verify attempt inserted with student_id, set_id, and submitted_at timestamp
    expect(mockInsertAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: "student-uuid-123",
        set_id: "set-uuid-789",
        submitted_at: expect.any(String),
      })
    );

    // 2. Verify responses inserted with converted 0..3 indices and confidence boolean
    expect(mockInsertResponses).toHaveBeenCalledWith([
      {
        attempt_id: "attempt-uuid-456",
        question_id: "q-uuid-1",
        answer: 1, // 'B' -> 1
        reason: 0, // 'A' -> 0
        confident: true,
      },
      {
        attempt_id: "attempt-uuid-456",
        question_id: "q-uuid-2",
        answer: 2, // 'C' -> 2
        reason: 1, // 'B' -> 1
        confident: false,
      },
    ]);

    // 3. Verify revalidation triggered for student and teacher views
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/quiz/set-uuid-789");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/teacher/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/teacher/sets/set-uuid-789");
  });

  it("handles stringified keys ('1', '2') seamlessly from Client Component payloads", async () => {
    mockSelectQuestions.mockResolvedValueOnce({
      data: [
        { id: "q-uuid-1", position: 1, correct_option: 0, correct_reason: 0 },
      ],
      error: null,
    });

    const { submitFullQuiz } = await import("./actions");

    const answers = {
      "1": { answerKey: "A", reasonKey: "D", confident: true },
    } as any;

    const result = await submitFullQuiz({
      setId: "set-uuid-789",
      answers,
    });

    expect(result.success).toBe(true);
    expect(mockInsertResponses).toHaveBeenCalledWith([
      {
        attempt_id: "attempt-uuid-456",
        question_id: "q-uuid-1",
        answer: 0, // 'A' -> 0
        reason: 3, // 'D' -> 3
        confident: true,
      },
    ]);
  });
});
