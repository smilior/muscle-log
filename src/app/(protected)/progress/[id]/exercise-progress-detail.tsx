"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  Target,
  Flame,
  Calendar,
} from "lucide-react";
import type { ExerciseProgress } from "@/lib/actions/progress";
import { ProgressChart } from "@/components/progress/progress-chart";

type Props = {
  progress: ExerciseProgress;
};

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
}: {
  icon: typeof Dumbbell;
  label: string;
  value: string;
  subValue?: string;
  trend?: number | null;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          {trend !== undefined && trend !== null && (
            <span
              className={`flex items-center gap-0.5 text-xs ${
                trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="size-3" />
              ) : trend < 0 ? (
                <TrendingDown className="size-3" />
              ) : (
                <Minus className="size-3" />
              )}
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          )}
        </div>
        <div className="mt-1">
          <span className="text-2xl font-bold">{value}</span>
          {subValue && (
            <span className="text-sm text-muted-foreground ml-1">{subValue}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function ExerciseProgressDetail({ progress }: Props) {
  const { exercise, history, stats } = progress;

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/progress">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{exercise.name}</h1>
          <p className="text-sm text-muted-foreground">
            {exercise.type === "strength" ? "筋トレ" : "有酸素"}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      {stats.totalSessions > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Dumbbell}
              label="最大重量"
              value={stats.allTimeMaxWeight ? `${stats.allTimeMaxWeight}` : "-"}
              subValue="kg"
              trend={stats.weightProgress}
            />
            <StatCard
              icon={Target}
              label="推定1RM"
              value={stats.allTimeMaxOneRM ? `${stats.allTimeMaxOneRM}` : "-"}
              subValue="kg"
            />
            <StatCard
              icon={Calendar}
              label="記録回数"
              value={`${stats.totalSessions}`}
              subValue="回"
            />
            <StatCard
              icon={Flame}
              label="ボリューム推移"
              value={stats.volumeProgress !== null ? `${stats.volumeProgress > 0 ? "+" : ""}${stats.volumeProgress}%` : "-"}
              trend={stats.volumeProgress}
            />
          </div>

          {/* Chart */}
          {history.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">重量の推移</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart history={history} />
              </CardContent>
            </Card>
          )}

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">記録履歴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...history].reverse().map((entry, index) => (
                <div
                  key={entry.date}
                  className="border-b last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/session/${entry.date}`}
                      className="font-medium hover:underline"
                    >
                      {formatDate(entry.date)}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {entry.maxWeight && `最大 ${entry.maxWeight}kg`}
                      {entry.estimatedOneRM && ` / 1RM ${entry.estimatedOneRM}kg`}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-muted-foreground">セット</div>
                    <div className="text-muted-foreground">重量</div>
                    <div className="text-muted-foreground">回数</div>
                    <div className="text-muted-foreground">RPE</div>
                    {entry.sets.map((set) => (
                      <div
                        key={`${entry.date}-${set.setNumber}`}
                        className="contents"
                      >
                        <div>{set.setNumber}</div>
                        <div>{set.weight ?? "-"}kg</div>
                        <div>{set.reps ?? "-"}回</div>
                        <div>{set.rpe ?? "-"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Dumbbell className="size-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">まだ記録がありません</p>
            <p className="text-sm">
              トレーニングを記録すると、ここに成長記録が表示されます
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
