"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Spinner } from "@/components/ui/spinner";
import {
  updatePreset,
  deletePreset,
  addExercisesToPreset,
  removeExerciseFromPreset,
  reorderPresetExercises,
} from "@/lib/actions/presets";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const BODY_PARTS: Record<string, string> = {
  chest: "胸",
  back: "背中",
  legs: "脚",
  shoulders: "肩",
  arms: "腕",
  core: "体幹",
};

export function PresetDetail({ preset, allExercises }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState(preset.name);
  const [isLoading, setIsLoading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Add exercise dialog state
  const [search, setSearch] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(
    new Set()
  );
  const [isAdding, setIsAdding] = useState(false);

  // Get exercises not already in preset
  const availableExercises = useMemo(() => {
    return allExercises.filter(
      (ex) => !preset.exercises.some((pe) => pe.exercise.id === ex.id)
    );
  }, [allExercises, preset.exercises]);

  // Get unique body parts from available exercises
  const bodyParts = useMemo(() => {
    return Array.from(
      new Set(
        availableExercises.map((e) => e.bodyPart).filter(Boolean) as string[]
      )
    );
  }, [availableExercises]);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return availableExercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesBodyPart =
        !selectedBodyPart || ex.bodyPart === selectedBodyPart;
      return matchesSearch && matchesBodyPart;
    });
  }, [availableExercises, search, selectedBodyPart]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await updatePreset(preset.id, { name: name.trim() });
      toast.success("プリセット名を更新しました");
      setEditOpen(false);
      router.refresh();
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePreset(preset.id);
      toast.success("プリセットを削除しました");
      router.push("/presets");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const handleAddExercises = async () => {
    if (selectedExercises.size === 0) return;

    setIsAdding(true);
    try {
      await addExercisesToPreset(preset.id, Array.from(selectedExercises));
      toast.success(`${selectedExercises.size}件の種目を追加しました`);
      setAddOpen(false);
      setSelectedExercises(new Set());
      setSearch("");
      setSelectedBodyPart(null);
      router.refresh();
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveExercise = async (presetExerciseId: string) => {
    try {
      await removeExerciseFromPreset(presetExerciseId);
      toast.success("種目を削除しました");
      router.refresh();
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    setIsReordering(true);

    const sorted = [...preset.exercises].sort((a, b) => a.order - b.order);
    const newOrder = sorted.map((pe) => pe.id);
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    try {
      await reorderPresetExercises(preset.id, newOrder);
      router.refresh();
    } catch {
      toast.error("並び替えに失敗しました");
    } finally {
      setIsReordering(false);
    }
  };

  const handleMoveDown = async (index: number) => {
    const sorted = [...preset.exercises].sort((a, b) => a.order - b.order);
    if (index === sorted.length - 1) return;
    setIsReordering(true);

    const newOrder = sorted.map((pe) => pe.id);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    try {
      await reorderPresetExercises(preset.id, newOrder);
      router.refresh();
    } catch {
      toast.error("並び替えに失敗しました");
    } finally {
      setIsReordering(false);
    }
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  const sortedExercises = [...preset.exercises].sort((a, b) => a.order - b.order);

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
          {sortedExercises.length > 0 ? (
            <div className="space-y-2">
              {sortedExercises.map((pe, index) => (
                <div
                  key={pe.id}
                  className={cn(
                    "flex items-center gap-2 p-3 bg-muted/50 rounded-lg",
                    isReordering && "opacity-50"
                  )}
                >
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || isReordering}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sortedExercises.length - 1 || isReordering}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <span className="flex-1 font-medium">{pe.exercise.name}</span>
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
            <p className="text-sm text-muted-foreground">種目がまだありません</p>
          )}

          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open);
              if (!open) {
                setSelectedExercises(new Set());
                setSearch("");
                setSelectedBodyPart(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 size-4" />
                種目を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>種目を追加</DialogTitle>
              </DialogHeader>

              {availableExercises.length > 0 ? (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="種目を検索..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Body part filter */}
                  {bodyParts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedBodyPart === null ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedBodyPart(null)}
                      >
                        すべて
                      </Button>
                      {bodyParts.map((part) => (
                        <Button
                          key={part}
                          variant={selectedBodyPart === part ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setSelectedBodyPart(part)}
                        >
                          {BODY_PARTS[part] || part}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Exercise list */}
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {filteredExercises.map((exercise) => (
                      <label
                        key={exercise.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedExercises.has(exercise.id)}
                          onCheckedChange={() => toggleExercise(exercise.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{exercise.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {exercise.type === "strength" ? "筋トレ" : "有酸素"}
                            {exercise.bodyPart && ` / ${BODY_PARTS[exercise.bodyPart] || exercise.bodyPart}`}
                          </div>
                        </div>
                      </label>
                    ))}
                    {filteredExercises.length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        該当する種目がありません
                      </p>
                    )}
                  </div>

                  {/* Add button */}
                  <Button
                    onClick={handleAddExercises}
                    disabled={selectedExercises.size === 0 || isAdding}
                    className="w-full"
                  >
                    {isAdding ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : null}
                    {selectedExercises.size > 0
                      ? `${selectedExercises.size}件の種目を追加`
                      : "種目を選択してください"}
                  </Button>
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
