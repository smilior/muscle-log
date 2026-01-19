"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  updatePreset,
  deletePreset,
  addExerciseToPreset,
  removeExerciseFromPreset,
} from "@/lib/actions/presets";
import { ArrowLeft, Pencil, Trash2, Plus, X, GripVertical } from "lucide-react";

type PresetExercise = {
  id: string;
  order: number;
  exercise: {
    id: string;
    name: string;
    type: string;
  };
};

type Preset = {
  id: string;
  name: string;
  exercises: PresetExercise[];
};

type Exercise = {
  id: string;
  name: string;
  type: string;
  bodyPart: string | null;
};

type Props = {
  preset: Preset;
  allExercises: Exercise[];
};

export function PresetDetail({ preset, allExercises }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState(preset.name);
  const [isLoading, setIsLoading] = useState(false);

  // Get exercises not already in preset
  const availableExercises = allExercises.filter(
    (ex) => !preset.exercises.some((pe) => pe.exercise.id === ex.id)
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await updatePreset(preset.id, { name: name.trim() });
      setEditOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    await deletePreset(preset.id);
    router.push("/presets");
  };

  const handleAddExercise = async (exerciseId: string) => {
    await addExerciseToPreset(preset.id, exerciseId);
    setAddOpen(false);
    router.refresh();
  };

  const handleRemoveExercise = async (presetExerciseId: string) => {
    await removeExerciseFromPreset(presetExerciseId);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/presets">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1">{preset.name}</h1>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Pencil className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>プリセット名を編集</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? "保存中..." : "保存"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>プリセットを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">種目リスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preset.exercises.length > 0 ? (
            <div className="space-y-2">
              {preset.exercises
                .sort((a, b) => a.order - b.order)
                .map((pe, index) => (
                  <div
                    key={pe.id}
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                  >
                    <GripVertical className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <span className="flex-1 font-medium">
                      {pe.exercise.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleRemoveExercise(pe.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              種目がまだありません
            </p>
          )}

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 size-4" />
                種目を追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>種目を追加</DialogTitle>
              </DialogHeader>
              {availableExercises.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {availableExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => handleAddExercise(exercise.id)}
                      className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors"
                    >
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.type === "strength" ? "筋トレ" : "有酸素"}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  追加できる種目がありません。
                  <Link href="/exercises" className="text-primary underline ml-1">
                    種目マスタ
                  </Link>
                  から種目を作成してください。
                </p>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
