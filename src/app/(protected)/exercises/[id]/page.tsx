import { notFound } from "next/navigation";
import { getExercise } from "@/lib/actions/exercises";
import { ExerciseDetail } from "./exercise-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExerciseDetailPage({ params }: Props) {
  const { id } = await params;
  const exercise = await getExercise(id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <ExerciseDetail exercise={exercise} />
      </div>
    </div>
  );
}
