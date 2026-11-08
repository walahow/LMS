import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { QuizRunnerView, type QuestionData } from "@/components/QuizRunnerView";
import { submitFullQuiz } from "./actions";

export const dynamic = "force-dynamic";

export default async function StudentQuizSetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;

  if (!isSupabaseConfigured()) {
    redirect("/quiz");
  }

  const { supabase } = await requireRole("student");

  // Fetch real question set
  const { data: set } = await supabase
    .from("question_sets")
    .select("id, title, indicator, subject, grade, published")
    .eq("id", setId)
    .single();

  if (!set || !set.published) {
    notFound();
  }

  // Fetch real questions for this set
  const { data: dbQuestions } = await supabase
    .from("questions")
    .select("id, position, stem, options, correct_option, reasons, correct_reason, explanation")
    .eq("set_id", setId)
    .order("position", { ascending: true });

  if (!dbQuestions || dbQuestions.length === 0) {
    notFound();
  }

  const idxToKey = ["A", "B", "C", "D"];

  const questions: QuestionData[] = dbQuestions.map((q) => {
    const rawOptions = (q.options as string[]) || [];
    const rawReasons = (q.reasons as string[]) || [];

    return {
      id: q.position,
      subject: set.subject || "FISIKA",
      topic: set.title.toUpperCase(),
      stem: q.stem,
      correctAnswer: idxToKey[q.correct_option] || "A",
      correctReason: idxToKey[q.correct_reason] || "A",
      explanation: q.explanation || "",
      options: rawOptions.map((text, idx) => ({
        key: idxToKey[idx] || String.fromCharCode(65 + idx),
        text,
      })),
      reasons: rawReasons.map((text, idx) => ({
        key: idxToKey[idx] || String.fromCharCode(65 + idx),
        text,
      })),
    };
  });

  async function handleSubmit(answers: Record<number, any>) {
    "use server";
    return submitFullQuiz({ setId, answers });
  }

  return (
    <QuizRunnerView
      setId={setId}
      setTitle={set.title}
      subject={set.subject || "FISIKA"}
      questions={questions}
      onSubmitQuiz={handleSubmit}
    />
  );
}
