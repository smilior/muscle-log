"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Exercise = {
  id: string;
  name: string;
  type: string;
  bodyPart: string | null;
};

type Props = {
  exercises: Exercise[];
  onSelect: (exerciseId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  trigger?: React.ReactNode;
};

const BODY_PARTS: Record<string, string> = {
  chest: "胸",
  back: "背中",
  legs: "脚",
  shoulders: "肩",
  arms: "腕",
  core: "体幹",
};

export function ExercisePicker({
  exercises,
  onSelect,
  open,
  onOpenChange,
  isLoading,
  trigger,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesBodyPart =
        !selectedBodyPart || ex.bodyPart === selectedBodyPart;
      return matchesSearch && matchesBodyPart;
    });
  }, [exercises, search, selectedBodyPart]);

  const handleSelect = (exerciseId: string) => {
    onSelect(exerciseId);
    setSearch("");
    setSelectedBodyPart(null);
  };

  const bodyParts = useMemo(() => {
    const parts = new Set(
      exercises.map((ex) => ex.bodyPart).filter(Boolean) as string[]
    );
    return Array.from(parts);
  }, [exercises]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>種目を追加</DialogTitle>
        </DialogHeader>

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
        <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => handleSelect(exercise.id)}
                disabled={isLoading}
                className={cn(
                  "w-full text-left p-3 hover:bg-muted rounded-lg transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2">
                  {exercise.type === "strength" ? (
                    <Dumbbell className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Clock className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{exercise.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {exercise.type === "strength" ? "筋トレ" : "有酸素"}
                      {exercise.bodyPart && ` / ${BODY_PARTS[exercise.bodyPart] || exercise.bodyPart}`}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : exercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">種目がありません</p>
              <a href="/exercises" className="text-primary underline text-sm">
                種目マスタから作成
              </a>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              「{search}」に一致する種目がありません
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
