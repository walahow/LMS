import { cookies } from "next/headers";
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
  return {
    profile: MOCK_PROFILE,
    stats: MOCK_STATS,
    sets: MOCK_SETS,
  };
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
