export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { isMissingColumnError } from "@/lib/auth-utils";
import { calculateTier1Score, diagnose } from "@/lib/diagnose";
import {
  StudentAttemptReviewView,
  type ReviewQuestionItem,
} from "@/components/StudentAttemptReviewView";

const NIL_ID = "00000000-0000-0000-0000-000000000000";

export default async function StudentHistoryAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const { supabase, user } = await requireRole("student");

  // Fetch attempt
  const { data: attempt } = await supabase
    .from("attempts")
    .select("id, set_id, student_id, submitted_at")
    .eq("id", attemptId)
    .single();

  if (!attempt || attempt.student_id !== user.id || !attempt.submitted_at) {
    notFound();
  }

  // Fetch set info
  const { data: set } = await supabase
    .from("question_sets")
    .select("title, subject, grade, indicator")
    .eq("id", attempt.set_id)
    .single();

  // Fetch responses
  const { data: responses } = await supabase
    .from("responses")
    .select("question_id, answer, reason, confident")
    .eq("attempt_id", attemptId);

  const questionIds = (responses ?? []).map((r) => r.question_id);
  let qRes: { data: any[] | null; error: any } = await supabase
    .from("questions")
    .select(
      "id, position, stem, options, reasons, correct_option, correct_reason, explanation, indicator, subtopic, cognitive_level"
    )
    .in("id", questionIds.length ? questionIds : [NIL_ID]);

  if (qRes.error && isMissingColumnError(qRes.error)) {
    qRes = await supabase
      .from("questions")
      .select("id, position, stem, options, reasons, correct_option, correct_reason, explanation")
      .in("id", questionIds.length ? questionIds : [NIL_ID]);
  }
  const questions = qRes.data;

  const questionById = new Map((questions ?? []).map((q) => [q.id, q]));

  const rows = (responses ?? [])
    .map((r) => ({ response: r, question: questionById.get(r.question_id) }))
    .filter((x) => x.question)
    .sort((a, b) => a.question!.position - b.question!.position);

  const reviewQuestions: ReviewQuestionItem[] = rows.map(
    ({ response, question }) => {
      const q = question!;
      const diagnosis = diagnose(response, q);

      return {
        id: q.id,
        position: q.position,
        stem: q.stem,
        options: (q.options as string[]) || [],
        reasons: (q.reasons as string[]) || [],
        studentAnswer: response.answer,
        studentReason: response.reason,
        correctOption: q.correct_option,
        correctReason: q.correct_reason,
        confident: Boolean(response.confident),
        diagnosis,
        explanation: (q as any).explanation || "",
        indicator: (q as any).indicator || undefined,
        subtopic: (q as any).subtopic || undefined,
        cognitiveLevel: (q as any).cognitive_level || undefined,
      };
    }
  );

  const score = calculateTier1Score(
    reviewQuestions.map((q) => ({
      answer: q.studentAnswer,
      correctOption: q.correctOption,
    })),
    reviewQuestions.length,
  );

  return (
    <StudentAttemptReviewView
      title={set?.title ?? "Ulasan Set Soal"}
      subject={set?.subject || "FISIKA"}
      grade={set?.grade || "KELAS X"}
      indicator={set?.indicator || ""}
      submittedAt={attempt.submitted_at}
      score={score}
      questions={reviewQuestions}
    />
  );
}
