"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ExerciseCard } from "@/components/session/exercise-card";
import { ExercisePicker } from "@/components/exercise-picker";
import { EmptyState } from "@/components/empty-state";
import {
  applyPreset,
  addExerciseToSession,
  removeExerciseFromSession,
  addSet,
  updateSet,
  removeSet,
  updateSessionExercise,
} from "@/lib/actions/sessions";
import { ArrowLeft, Plus, Dumbbell, LayoutTemplate } from "lucide-react";

type ExerciseSet = {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
};

type Media = {
  id: string;
  url: string;
  type: string;
};

type ExerciseVideo = {
  id: string;
  youtubeUrl: string;
  title: string | null;
};

type SessionExercise = {
  id: string;
  order: number;
  memo: string | null;
  durationMinutes: number | null;
  exercise: {
    id: string;
    name: string;
    type: string;
    videos: ExerciseVideo[];
  };
  sets: ExerciseSet[];
  media: Media[];
};

type Session = {
  id: string;
  date: string;
  memo: string | null;
  isRestDay: boolean;
  preset: { id: string; name: string } | null;
  exercises: SessionExercise[];
};

type Exercise = {
  id: string;
  name: string;
  type: string;
  bodyPart: string | null;
};

type Preset = {
  id: string;
  name: string;
};

type Props = {
  date: string;
  session: Session | null | undefined;
  allExercises: Exercise[];
  presets: Preset[];
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}/${date.getDate()}（${days[date.getDay()]}）`;
}

export function SessionDetail({
  date,
  session,
  allExercises,
  presets,
}: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [isApplyingPreset, startPresetTransition] = useTransition();
  const [isAddingExercise, startAddExerciseTransition] = useTransition();
  const [applyingPresetId, setApplyingPresetId] = useState<string | null>(null);

  const handleApplyPreset = async (presetId: string) => {
    setApplyingPresetId(presetId);
    startPresetTransition(async () => {
      try {
        await applyPreset(date, presetId);
        toast.success("プリセットを適用しました");
        setPresetOpen(false);
        router.refresh();
      } catch {
        toast.error("プリセットの適用に失敗しました");
      } finally {
        setApplyingPresetId(null);
      }
    });
  };

  const handleAddExercise = async (exerciseId: string) => {
    startAddExerciseTransition(async () => {
      try {
        await addExerciseToSession(date, exerciseId);
        const exercise = allExercises.find((e) => e.id === exerciseId);
        toast.success(`${exercise?.name || "種目"}を追加しました`);
        setAddOpen(false);
        router.refresh();
      } catch {
        toast.error("種目の追加に失敗しました");
      }
    });
  };

  const handleRemoveExercise = async (id: string) => {
    try {
      await removeExerciseFromSession(id);
      toast.success("種目を削除しました");
      router.refresh();
    } catch {
      toast.error("種目の削除に失敗しました");
    }
  };

  const handleAddSet = async (sessionExerciseId: string) => {
    try {
      await addSet(sessionExerciseId, {});
      router.refresh();
    } catch {
      toast.error("セットの追加に失敗しました");
    }
  };

  const handleUpdateSet = async (
    setId: string,
    field: "weight" | "reps" | "rpe",
    value: string
  ) => {
    const numValue = value === "" ? null : Number(value);
    try {
      await updateSet(setId, { [field]: numValue });
    } catch {
      toast.error("保存に失敗しました");
    }
  };

  const handleRemoveSet = async (setId: string) => {
    try {
      await removeSet(setId);
      router.refresh();
    } catch {
      toast.error("セットの削除に失敗しました");
    }
  };

  const handleUpdateDuration = async (
    sessionExerciseId: string,
    value: string
  ) => {
    const numValue = value === "" ? null : Number(value);
    try {
      await updateSessionExercise(sessionExerciseId, {
        durationMinutes: numValue,
      });
    } catch {
      toast.error("保存に失敗しました");
    }
  };

  // Get exercises not in session
  const availableExercises = allExercises.filter(
    (ex) => !session?.exercises.some((se) => se.exercise.id === ex.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{formatDate(date)}</h1>
          {session?.preset && (
            <p className="text-sm text-muted-foreground">
              {session.preset.name}
            </p>
          )}
        </div>
      </div>

      {/* Preset selection */}
      {presets.length > 0 && (
        <Dialog open={presetOpen} onOpenChange={setPresetOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <LayoutTemplate className="size-4 mr-2" />
              プリセットを適用
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>プリセットを選択</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  disabled={isApplyingPreset}
                  className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors flex items-center justify-between disabled:opacity-50"
                >
                  <span>{preset.name}</span>
                  {applyingPresetId === preset.id && <Spinner size="sm" />}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Exercise list */}
      {session?.exercises && session.exercises.length > 0 ? (
        <div className="space-y-4">
          {session.exercises
            .sort((a, b) => a.order - b.order)
            .map((se) => (
              <ExerciseCard
                key={se.id}
                sessionExercise={se}
                onRemove={handleRemoveExercise}
                onAddSet={handleAddSet}
                onUpdateSet={handleUpdateSet}
                onRemoveSet={handleRemoveSet}
                onUpdateDuration={handleUpdateDuration}
              />
            ))}
        </div>
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="まだ種目がありません"
          description="プリセットを適用するか、下のボタンから種目を追加してトレーニングを記録しましょう"
        />
      )}

      {/* Add exercise */}
      <ExercisePicker
        exercises={availableExercises}
        onSelect={handleAddExercise}
        open={addOpen}
        onOpenChange={setAddOpen}
        isLoading={isAddingExercise}
        trigger={
          <Button className="w-full" disabled={isAddingExercise}>
            {isAddingExercise ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Plus className="mr-2 size-4" />
            )}
            種目を追加
          </Button>
        }
      />
    </div>
  );
}
