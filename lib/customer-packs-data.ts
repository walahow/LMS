import packsJson from "./customer-packs.json";
import type {
  KisiKisiInputItem,
  ManualQuestionInputItem,
  Tier1InputItem,
} from "./tier1-parser";

export interface CustomerPackQuestion {
  stem: string;
  options: string[];
  correctOption: number;
  reasons: string[];
  correctReason: number;
  explanation: string;
  indicator: string;
  subtopic: string;
  cognitiveLevel: string;
}

export interface CustomerQuestionPack {
  key: "hukum-newton" | "fluida-dinamis";
  title: string;
  subject: string;
  grade: string;
  indicator: string;
  questions: CustomerPackQuestion[];
}

export const CUSTOMER_QUESTION_PACKS = packsJson as CustomerQuestionPack[];

export function packToKisiKisiItems(pack: CustomerQuestionPack): KisiKisiInputItem[] {
  return pack.questions.map((q) => ({
    subtopic: q.subtopic,
    cognitive_level: q.cognitiveLevel,
    indicator: q.indicator,
  }));
}

export function packToTier1Items(pack: CustomerQuestionPack): Tier1InputItem[] {
  return pack.questions.map((q) => ({
    stem: q.stem,
    options: [...q.options],
    correct_option: q.correctOption,
    subtopic: q.subtopic,
    cognitive_level: q.cognitiveLevel,
    indicator: q.indicator,
  }));
}

export function packToManualItems(pack: CustomerQuestionPack): ManualQuestionInputItem[] {
  return pack.questions.map((q) => ({
    stem: q.stem,
    options: [...q.options],
    correct_option: q.correctOption,
    reasons: [...q.reasons],
    correct_reason: q.correctReason,
    explanation: q.explanation,
    subtopic: q.subtopic,
    cognitive_level: q.cognitiveLevel,
    indicator: q.indicator,
  }));
}
