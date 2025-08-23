import { ExamHeader } from "@/components/exam/exam-header";
import { mockExams } from "@/lib/data";

export default function ExamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { examId: string };
}) {
  const exam = mockExams.find((e) => e.id === params.examId);

  if (!exam) {
    return <div>Exam not found</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <ExamHeader title={exam.title} duration={exam.duration} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
