"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import { Plus, Dumbbell, Heart, ChevronRight } from "lucide-react";

const BODY_PART_LABELS: Record<string, string> = {
  chest: "胸",
  back: "背中",
  legs: "足",
  shoulders: "肩",
  arms: "腕",
  core: "体幹",
};

type Exercise = {
  id: string;
  name: string;
  type: string;
  bodyPart: string | null;
  videos: { id: string }[];
};

type Props = {
  initialExercises: Exercise[];
};

export function ExerciseList({ initialExercises }: Props) {
  const [open, setOpen] = useState(false);
  const exercises = initialExercises;

  const strengthExercises = exercises.filter((e) => e.type === "strength");
  const cardioExercises = exercises.filter((e) => e.type === "cardio");

  return (
    <div className="space-y-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 size-4" />
            種目を追加
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>種目を追加</DialogTitle>
          </DialogHeader>
          <ExerciseForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {strengthExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Dumbbell className="size-5" />
              筋トレ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {strengthExercises.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/exercises/${exercise.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{exercise.name}</div>
                    {exercise.bodyPart && (
                      <div className="text-sm text-muted-foreground">
                        {BODY_PART_LABELS[exercise.bodyPart] ?? exercise.bodyPart}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {cardioExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="size-5" />
              有酸素
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {cardioExercises.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/exercises/${exercise.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium">{exercise.name}</div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {exercises.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            種目がまだありません。上のボタンから追加してください。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
