import { ExamView } from "@/components/exam/exam-view";
import { mockExams } from "@/lib/data";
import { notFound } from "next/navigation";

export default function ExamPage({ params }: { params: { examId: string } }) {
  const exam = mockExams.find((e) => e.id === params.examId);

  if (!exam) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <ExamView exam={exam} />
    </div>
  );
}
