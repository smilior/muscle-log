import { getAllExercisesWithProgress } from "@/lib/actions/progress";
import { ProgressList } from "./progress-list";

export default async function ProgressPage() {
  const exercises = await getAllExercisesWithProgress();

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">成長記録</h1>
        <p className="text-sm text-muted-foreground">
          種目ごとの進捗を確認できます
        </p>
      </div>

      <ProgressList exercises={exercises} />
    </div>
  );
}
