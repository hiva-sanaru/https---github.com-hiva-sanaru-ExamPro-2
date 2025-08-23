import { ReviewView } from "@/components/exam/review-view";
import { mockExams } from "@/lib/data";
import { notFound } from "next/navigation";

export default function ReviewPage({ params }: { params: { examId: string } }) {
  const exam = mockExams.find((e) => e.id === params.examId);

  if (!exam) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
        <div className="space-y-4 text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Review Your Answers</h1>
            <p className="text-muted-foreground text-lg">Please check your answers carefully before submitting.</p>
        </div>
        <ReviewView exam={exam} />
    </div>
  );
}
