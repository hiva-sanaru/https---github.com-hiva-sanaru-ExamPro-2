import { ExamHeader } from "@/components/exam/exam-header";
import { getExam } from "@/services/examService";
import { notFound } from "next/navigation";

export default async function ExamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { examId: string };
}) {
  const exam = await getExam(params.examId);

  if (!exam) {
    notFound();
    return null; // or a more graceful fallback
  }

  return (
    <div className="flex flex-col bg-muted/40">
      {/* The header is now rendered within ExamView to manage question-specific timers */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
