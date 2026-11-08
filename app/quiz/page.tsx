"use client";

import { QuizRunnerView, SAMPLE_QUESTIONS } from "@/components/QuizRunnerView";

export default function StandaloneQuizPage() {
  return (
    <QuizRunnerView
      subject="FISIKA"
      setTitle="HUKUM NEWTON"
      questions={SAMPLE_QUESTIONS}
    />
  );
}
