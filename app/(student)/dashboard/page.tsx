import { requireRole } from "@/lib/auth";
import {
  StudentDashboardView,
  type DashboardSet,
  type StudentProfileInfo,
  type StudentStats,
} from "@/components/StudentDashboardView";

export const dynamic = "force-dynamic";

const MOCK_PROFILE: StudentProfileInfo = {
  fullName: "Rani Putri",
  initials: "RP",
  email: "student@lms.local",
  grade: "KELAS X-A",
};

const MOCK_STATS: StudentStats = {
  completedSets: 2,
  totalSets: 4,
  averageScore: 74,
  pendingSets: 2,
};

const MOCK_SETS: DashboardSet[] = [
  {
    id: "mock-pack-1",
    title: "Hukum II & III Newton pada Gerak Benda",
    indicator:
      "Menganalisis hubungan antara gaya, massa, dan percepatan pada gerak lurus serta aksi-reaksi benda.",
    subject: "Fisika",
    grade: "Kelas 10",
    totalQuestions: 6,
    status: "completed",
    score: 67,
    lastAttemptId: "att-01",
  },
  {
    id: "mock-pack-2",
    title: "Fotosintesis dan Pertukaran Gas pada Tumbuhan",
    indicator:
      "Membedakan reaksi terang dan siklus Calvin serta faktor pembatas pembentukan glukosa.",
    subject: "Biologi",
    grade: "Kelas 10",
    totalQuestions: 5,
    status: "completed",
    score: 80,
    lastAttemptId: "att-05",
  },
  {
    id: "mock-pack-3",
    title: "Reaksi Asam Basa dan Derajat Keasaman (pH)",
    indicator:
      "Mengidentifikasi kekuatan asam-basa berdasarkan derajat ionisasi dan perubahan warna indikator.",
    subject: "Kimia",
    grade: "Kelas 10",
    totalQuestions: 4,
    status: "in_progress",
    progressCount: 2,
  },
  {
    id: "mock-pack-4",
    title: "Siklus Hidrologi dan Pembentukan Awan",
    indicator:
      "Menganalisis proses evaporasi, kondensasi, dan presipitasi dalam daur air.",
    subject: "Geografi",
    grade: "Kelas 10",
    totalQuestions: 4,
    status: "not_started",
  },
];

async function getDashboardData(): Promise<{
  profile: StudentProfileInfo;
  stats: StudentStats;
  sets: DashboardSet[];
}> {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!isSupabaseConfigured) {
    return {
      profile: MOCK_PROFILE,
      stats: MOCK_STATS,
      sets: MOCK_SETS,
    };
  }

  try {
    const { supabase, user, profile } = await requireRole("student");

    // Fetch published question sets
    const { data: rawSets } = await supabase
      .from("question_sets")
      .select("id, title, indicator, subject, grade")
      .eq("published", true)
      .order("created_at", { ascending: false });

    const setIds = (rawSets ?? []).map((s) => s.id);

    // Fetch questions count for each set
    const { data: questions } = await supabase
      .from("questions")
      .select("id, set_id, correct_option, correct_reason");

    const countBySet = new Map<string, number>();
    const questionsBySet = new Map<
      string,
      { id: string; correct_option: number; correct_reason: number }[]
    >();
    (questions ?? []).forEach((q) => {
      countBySet.set(q.set_id, (countBySet.get(q.set_id) || 0) + 1);
      const list = questionsBySet.get(q.set_id) || [];
      list.push(q);
      questionsBySet.set(q.set_id, list);
    });

    // Fetch student's attempts
    const { data: attempts } = await supabase
      .from("attempts")
      .select("id, set_id, started_at, submitted_at")
      .eq("student_id", user.id)
      .in("set_id", setIds.length > 0 ? setIds : ["00000000-0000-0000-0000-000000000000"])
      .order("started_at", { ascending: false });

    // Separate in-progress and completed attempts
    const inProgressBySet = new Map<string, { id: string }>();
    const completedBySet = new Map<string, { id: string; submitted_at: string }>();

    (attempts ?? []).forEach((att) => {
      if (!att.submitted_at && !inProgressBySet.has(att.set_id)) {
        inProgressBySet.set(att.set_id, { id: att.id });
      } else if (att.submitted_at && !completedBySet.has(att.set_id)) {
        completedBySet.set(att.set_id, { id: att.id, submitted_at: att.submitted_at });
      }
    });

    // Fetch responses for completed attempts
    const completedAttemptIds = Array.from(completedBySet.values()).map((a) => a.id);
    let responses: {
      attempt_id: string;
      question_id: string;
      answer: number;
      reason: number;
      confident: boolean;
    }[] = [];

    if (completedAttemptIds.length > 0) {
      const { data: respData } = await supabase
        .from("responses")
        .select("attempt_id, question_id, answer, reason, confident")
        .in("attempt_id", completedAttemptIds);
      responses = respData ?? [];
    }

    // Group responses by attempt
    const responsesByAttempt = new Map<string, typeof responses>();
    responses.forEach((r) => {
      const list = responsesByAttempt.get(r.attempt_id) || [];
      list.push(r);
      responsesByAttempt.set(r.attempt_id, list);
    });

    let totalAnsweredQuestions = 0;
    let totalCorrectQuestions = 0;

    const formattedSets: DashboardSet[] = (rawSets ?? []).map((s) => {
      const totalQ = countBySet.get(s.id) || 10;
      const inProgress = inProgressBySet.get(s.id);
      const completed = completedBySet.get(s.id);

      let status: "not_started" | "in_progress" | "completed" = "not_started";
      let score: number | null = null;
      let lastAttemptId: string | undefined = undefined;

      if (inProgress) {
        status = "in_progress";
      } else if (completed) {
        status = "completed";
        lastAttemptId = completed.id;
        const setQuestions = questionsBySet.get(s.id) || [];
        const qMap = new Map(setQuestions.map((q) => [q.id, q]));
        const attResponses = responsesByAttempt.get(completed.id) || [];

        let correctCount = 0;
        attResponses.forEach((r) => {
          const q = qMap.get(r.question_id);
          if (q) {
            totalAnsweredQuestions++;
            if (r.answer === q.correct_option && r.reason === q.correct_reason && r.confident) {
              correctCount++;
              totalCorrectQuestions++;
            }
          }
        });

        score = attResponses.length > 0 ? Math.round((correctCount / attResponses.length) * 100) : 0;
      }

      return {
        id: s.id,
        title: s.title,
        indicator: s.indicator,
        subject: s.subject || "Umum",
        grade: s.grade,
        totalQuestions: totalQ,
        status,
        progressCount: inProgress ? 1 : undefined,
        score,
        lastAttemptId,
      };
    });

    const initials = profile.full_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const completedCount = completedBySet.size;
    const pendingCount = Math.max(0, (rawSets ?? []).length - completedCount);
    const overallAverageScore =
      totalAnsweredQuestions > 0
        ? Math.round((totalCorrectQuestions / totalAnsweredQuestions) * 100)
        : 0;

    return {
      profile: {
        fullName: profile.full_name,
        initials: initials || "ST",
        email: user.email || "student@lms.local",
        grade: "KELAS X-A",
      },
      stats: {
        completedSets: completedCount,
        totalSets: (rawSets ?? []).length,
        averageScore: overallAverageScore,
        pendingSets: pendingCount,
      },
      sets: formattedSets,
    };
  } catch {
    return {
      profile: MOCK_PROFILE,
      stats: MOCK_STATS,
      sets: MOCK_SETS,
    };
  }
}

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ selesai?: string }>;
}) {
  const { selesai } = await searchParams;
  const data = await getDashboardData();

  return (
    <StudentDashboardView
      profile={data.profile}
      stats={data.stats}
      sets={data.sets}
      showCelebrationAlert={selesai === "1"}
    />
  );
}
