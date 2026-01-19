"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExercise, updateExercise } from "@/lib/actions/exercises";

const BODY_PARTS = [
  { value: "chest", label: "胸" },
  { value: "back", label: "背中" },
  { value: "legs", label: "足" },
  { value: "shoulders", label: "肩" },
  { value: "arms", label: "腕" },
  { value: "core", label: "体幹" },
] as const;

type Props = {
  exercise?: {
    id: string;
    name: string;
    type: string;
    bodyPart: string | null;
  };
  onSuccess?: () => void;
};

export function ExerciseForm({ exercise, onSuccess }: Props) {
  const [name, setName] = useState(exercise?.name ?? "");
  const [type, setType] = useState<"strength" | "cardio">(
    (exercise?.type as "strength" | "cardio") ?? "strength"
  );
  const [bodyPart, setBodyPart] = useState(exercise?.bodyPart ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      if (exercise) {
        await updateExercise(exercise.id, {
          name: name.trim(),
          type,
          bodyPart: bodyPart || undefined,
        });
      } else {
        await createExercise({
          name: name.trim(),
          type,
          bodyPart: bodyPart || undefined,
        });
      }
      if (!exercise) {
        setName("");
        setType("strength");
        setBodyPart("");
      }
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">種目名</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ダンベルプレス"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">種別</Label>
        <Select value={type} onValueChange={(v) => setType(v as "strength" | "cardio")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strength">筋トレ</SelectItem>
            <SelectItem value="cardio">有酸素</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "strength" && (
        <div className="space-y-2">
          <Label htmlFor="bodyPart">対象部位</Label>
          <Select value={bodyPart} onValueChange={setBodyPart}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {BODY_PARTS.map((part) => (
                <SelectItem key={part.value} value={part.value}>
                  {part.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" disabled={isLoading || !name.trim()}>
        {isLoading ? "保存中..." : exercise ? "更新" : "追加"}
      </Button>
    </form>
  );
}
