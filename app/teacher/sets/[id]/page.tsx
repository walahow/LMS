import { notFound } from "next/navigation";
import { fetchTeacherData } from "@/lib/teacher-data";
import { TeacherPackDetailView } from "@/components/TeacherPackDetailView";

export const dynamic = "force-dynamic";

export default async function TeacherSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, testPacks } = await fetchTeacherData();

  const pack = testPacks.find((p) => p.id === id) || (id.startsWith("mock-") ? testPacks[0] : null);

  if (!pack) {
    notFound();
  }

  return <TeacherPackDetailView pack={pack} profile={profile} />;
}
