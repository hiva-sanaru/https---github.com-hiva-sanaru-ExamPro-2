
import { ExamView } from "@/components/exam/exam-view";
import { getExam } from "@/services/examService";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function ExamPageContent({ examId }: { examId: string }) {
  const exam = await getExam(examId);

  if (!exam) {
    notFound();
  }

  return <ExamView exam={exam} />;
}


export default function ExamPage({ params }: { params: { examId: string } }) {
  return (
    <div className="container mx-auto max-w-4xl py-8">
       <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <ExamPageContent examId={params.examId} />
      </Suspense>
    </div>
  );
}
