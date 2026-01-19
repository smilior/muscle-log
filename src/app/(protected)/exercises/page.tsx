import Link from "next/link";
import { getExercises } from "@/lib/actions/exercises";
import { ExerciseList } from "./exercise-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">種目マスタ</h1>
        </div>
        <ExerciseList initialExercises={exercises} />
      </div>
    </div>
  );
}
