"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Dumbbell,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ExerciseWithStats = {
  id: string;
  name: string;
  type: string;
  bodyPart: string | null;
  sessionCount: number;
  maxWeight: number | null;
  maxOneRM: number | null;
  weightProgress: number | null;
};

type Props = {
  exercises: ExerciseWithStats[];
};

const BODY_PARTS: Record<string, string> = {
  chest: "胸",
  back: "背中",
  legs: "脚",
  shoulders: "肩",
  arms: "腕",
  core: "体幹",
};

function ProgressIndicator({ value }: { value: number | null }) {
  if (value === null) return <Minus className="size-4 text-muted-foreground" />;

  if (value > 0) {
    return (
      <span className="flex items-center gap-0.5 text-green-600">
        <TrendingUp className="size-4" />
        <span className="text-xs font-medium">+{value}%</span>
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-0.5 text-red-600">
        <TrendingDown className="size-4" />
        <span className="text-xs font-medium">{value}%</span>
      </span>
    );
  }
  return <Minus className="size-4 text-muted-foreground" />;
}

export function ProgressList({ exercises }: Props) {
  const [search, setSearch] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  const bodyParts = Array.from(
    new Set(exercises.map((e) => e.bodyPart).filter(Boolean) as string[])
  );

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesBodyPart = !selectedBodyPart || ex.bodyPart === selectedBodyPart;
    return matchesSearch && matchesBodyPart;
  });

  const exercisesWithData = filteredExercises.filter((ex) => ex.sessionCount > 0);
  const exercisesWithoutData = filteredExercises.filter((ex) => ex.sessionCount === 0);

  return (
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

      {/* Exercise list with data */}
      {exercisesWithData.length > 0 && (
        <div className="space-y-3">
          {exercisesWithData.map((ex) => (
            <Link key={ex.id} href={`/progress/${ex.id}`} prefetch={true}>
              <Card className="hover:bg-muted/50 active:scale-[0.99] transition-all duration-100">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {ex.type === "strength" ? (
                        <Dumbbell className="size-5 text-muted-foreground" />
                      ) : (
                        <Clock className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{ex.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {ex.sessionCount}回記録
                        {ex.maxWeight && ` / 最大 ${ex.maxWeight}kg`}
                        {ex.maxOneRM && ` / 推定1RM ${ex.maxOneRM}kg`}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <ProgressIndicator value={ex.weightProgress} />
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Exercise list without data */}
      {exercisesWithoutData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            記録なし
          </h3>
          {exercisesWithoutData.map((ex) => (
            <Card key={ex.id} className="opacity-60">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {ex.type === "strength" ? (
                      <Dumbbell className="size-5 text-muted-foreground" />
                    ) : (
                      <Clock className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{ex.name}</div>
                    <div className="text-xs text-muted-foreground">
                      まだ記録がありません
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredExercises.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {search ? `「${search}」に一致する種目がありません` : "種目がありません"}
        </div>
      )}
    </div>
  );
}
