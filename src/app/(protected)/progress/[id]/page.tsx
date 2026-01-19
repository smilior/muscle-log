import { notFound } from "next/navigation";
import { getExerciseProgress } from "@/lib/actions/progress";
import { ExerciseProgressDetail } from "./exercise-progress-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExerciseProgressPage({ params }: Props) {
  const { id } = await params;
  const progress = await getExerciseProgress(id);

  if (!progress) {
    notFound();
  }

  return <ExerciseProgressDetail progress={progress} />;
}
