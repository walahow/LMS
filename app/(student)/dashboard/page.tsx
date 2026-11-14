import { requireRole } from "@/lib/auth";
import { calculateTier1Score } from "@/lib/diagnose";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  StudentDashboardView,
  type DashboardSet,
  type StudentProfileInfo,
  type StudentStats,
} from "@/components/StudentDashboardView";

export const dynamic = "force-dynamic";

// Fallback for standalone preview when Supabase env is not configured
const FALLBACK_PROFILE: StudentProfileInfo = {
  fullName: "Hermione Granger",
  initials: "HG",
  email: "student@lms.local",
  grade: "KELAS X-A",
};

const FALLBACK_STATS: StudentStats = {
  completedSets: 0,
  totalSets: 0,
  averageScore: 0,
  pendingSets: 0,
};

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ selesai?: string }>;
}) {
  const { selesai } = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <StudentDashboardView
        profile={FALLBACK_PROFILE}
        stats={FALLBACK_STATS}
        sets={[]}
        showCelebrationAlert={selesai === "1"}
      />
    );
  }

  const { supabase, user, profile } = await requireRole("student");

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const displayContact =
    profile.username && (!user.email || user.email.endsWith("@lms.local"))
      ? `@${profile.username}`
      : user.email || "student@lms.local";

  const studentProfile: StudentProfileInfo = {
    fullName: profile.full_name,
    initials,
    email: displayContact,
    grade: profile.grade || "KELAS X-A",
  };

  // Fetch real published question sets
  const setsRes = await supabase
    .from("question_sets")
    .select("id, title, indicator, subject, grade, published, questions(id)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const dbSets: any[] = setsRes.data ?? [];

  // Fetch student's real attempts
  const attemptsRes = await supabase
    .from("attempts")
    .select("id, set_id, submitted_at, started_at")
    .eq("student_id", user.id)
    .order("started_at", { ascending: false });

  const dbAttempts: any[] = attemptsRes.data ?? [];

  const sets: DashboardSet[] = [];
  let completedCount = 0;
  let totalScoreSum = 0;

  for (const s of dbSets) {
    const totalQuestions = (s.questions as any[])?.length ?? 0;
    const attempt = dbAttempts.find((a: any) => a.set_id === s.id);

    if (!attempt) {
      sets.push({
        id: s.id,
        title: s.title,
        indicator: s.indicator,
        subject: s.subject || "Fisika",
        grade: s.grade || "Kelas 10",
        totalQuestions,
        status: "not_started",
      });
    } else if (attempt.submitted_at) {
      // Completed attempt: calculate real score
      const responsesRes = await supabase
        .from("responses")
        .select("answer, reason, question_id, questions(correct_option, correct_reason)")
        .eq("attempt_id", attempt.id);

      const responses: any[] = responsesRes.data ?? [];
      const score = calculateTier1Score(
        responses.map((r) => ({
          answer: r.answer,
          correctOption: (r.questions as any)?.correct_option ?? -1,
        })),
        totalQuestions,
      );
      completedCount++;
      totalScoreSum += score;

      sets.push({
        id: s.id,
        title: s.title,
        indicator: s.indicator,
        subject: s.subject || "Fisika",
        grade: s.grade || "Kelas 10",
        totalQuestions,
        status: "completed",
        score,
        lastAttemptId: attempt.id,
      });
    } else {
      // In-progress attempt
      const { count: answeredCount } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("attempt_id", attempt.id);

      sets.push({
        id: s.id,
        title: s.title,
        indicator: s.indicator,
        subject: s.subject || "Fisika",
        grade: s.grade || "Kelas 10",
        totalQuestions,
        status: "in_progress",
        progressCount: answeredCount ?? 0,
        lastAttemptId: attempt.id,
      });
    }
  }

  const averageScore = completedCount > 0 ? Math.round(totalScoreSum / completedCount) : 0;

  const stats: StudentStats = {
    completedSets: completedCount,
    totalSets: sets.length,
    averageScore,
    pendingSets: sets.length - completedCount,
  };

  return (
    <StudentDashboardView
      profile={studentProfile}
      stats={stats}
      sets={sets}
      showCelebrationAlert={selesai === "1"}
    />
  );
}
