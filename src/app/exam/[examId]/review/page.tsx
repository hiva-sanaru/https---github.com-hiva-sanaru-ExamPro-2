
import { ReviewView } from "@/components/exam/review-view";
import { getExam } from "@/services/examService";
import { notFound } from "next/navigation";

export default async function ReviewPage({ params }: { params: { examId: string } }) {
  const exam = await getExam(params.examId);

  if (!exam) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-4 text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">回答の確認</h1>
            <p className="text-muted-foreground text-lg">提出前に回答を注意深く確認してください。</p>
        </div>
        <ReviewView exam={exam} />
    </div>
  );
}
