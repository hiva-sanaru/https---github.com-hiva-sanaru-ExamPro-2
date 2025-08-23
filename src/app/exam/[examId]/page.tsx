
import { ExamView } from "@/components/exam/exam-view";
import { getExam } from "@/services/examService";
import { notFound } from "next/navigation";

export default async function ExamPage({ params }: { params: { examId: string } }) {
  const exam = await getExam(params.examId);

  if (!exam) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <ExamView exam={exam} />
    </div>
  );
}
