export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchTeacherData } from "@/lib/teacher-data";
import { TeacherStudentDetailView } from "@/components/TeacherStudentDetailView";

export default async function TeacherSetStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string; studentId: string }>;
}) {
  const { id, studentId } = await params;
  const { testPacks } = await fetchTeacherData();

  const pack = testPacks.find((p) => p.id === id);

  if (!pack) {
    notFound();
  }

  const student = pack.students.find((s) => s.studentId === studentId);

  if (!student) {
    notFound();
  }

  return (
    <TeacherStudentDetailView
      packId={pack.id}
      packTitle={pack.title}
      subject={pack.subject}
      grade={pack.grade}
      indicator={pack.indicator}
      backHref={`/teacher/sets/${pack.id}`}
      student={student}
      questions={student.questions}
    />
  );
}
