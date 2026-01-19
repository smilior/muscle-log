import { notFound } from "next/navigation";
import { getPreset } from "@/lib/actions/presets";
import { getExercises } from "@/lib/actions/exercises";
import { PresetDetail } from "./preset-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PresetDetailPage({ params }: Props) {
  const { id } = await params;
  const [preset, exercises] = await Promise.all([
    getPreset(id),
    getExercises(),
  ]);

  if (!preset) {
    notFound();
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <PresetDetail preset={preset} allExercises={exercises} />
      </div>
    </div>
  );
}
