export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchTeacherData } from "@/lib/teacher-data";
import { TeacherStudentDetailView } from "@/components/TeacherStudentDetailView";

export default async function TeacherStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { testPacks } = await fetchTeacherData();

  // Find any test pack containing this student
  let foundPack = null;
  let foundStudent = null;

  for (const pack of testPacks) {
    const student = pack.students.find((s) => s.studentId === id);
    if (student) {
      foundPack = pack;
      foundStudent = student;
      break;
    }
  }

  // Fallback for mock IDs
  if (!foundStudent && id.startsWith("mock-") && testPacks.length > 0 && testPacks[0].students.length > 0) {
    foundPack = testPacks[0];
    foundStudent = testPacks[0].students[0];
  }

  if (!foundPack || !foundStudent) {
    notFound();
  }

  return (
    <TeacherStudentDetailView
      packId={foundPack.id}
      packTitle={foundPack.title}
      subject={foundPack.subject}
      grade={foundPack.grade}
      indicator={foundPack.indicator}
      backHref="/teacher/dashboard"
      student={foundStudent}
      questions={foundStudent.questions}
    />
  );
}
