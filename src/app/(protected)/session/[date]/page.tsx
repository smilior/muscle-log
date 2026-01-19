import { getSession } from "@/lib/actions/sessions";
import { getExercises } from "@/lib/actions/exercises";
import { getPresets } from "@/lib/actions/presets";
import { SessionDetail } from "./session-detail";

type Props = {
  params: Promise<{ date: string }>;
};

export default async function SessionPage({ params }: Props) {
  const { date } = await params;
  const [session, exercises, presets] = await Promise.all([
    getSession(date),
    getExercises(),
    getPresets(),
  ]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <SessionDetail
          date={date}
          session={session}
          allExercises={exercises}
          presets={presets}
        />
      </div>
    </div>
  );
}
