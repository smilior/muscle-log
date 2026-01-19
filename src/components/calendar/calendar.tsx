"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dumbbell, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type Session = {
  id: string;
  date: string;
  isRestDay: boolean;
  preset: { id: string; name: string } | null;
  exercises: { id: string; sets?: { id: string }[] }[];
};

type Props = {
  sessions: Session[];
  initialYear: number;
  initialMonth: number;
  onMonthChange: (year: number, month: number) => void;
};

const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getWorkoutIntensity(session: Session | undefined): "none" | "light" | "medium" | "heavy" {
  if (!session || session.exercises.length === 0) return "none";

  // Count total sets
  const totalSets = session.exercises.reduce(
    (acc, ex) => acc + (ex.sets?.length || 0),
    0
  );

  if (totalSets === 0 && session.exercises.length > 0) {
    return "light";
  }
  if (totalSets >= 15) return "heavy";
  if (totalSets >= 8) return "medium";
  return "light";
}

const intensityColors = {
  none: "",
  light: "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50",
  medium: "bg-green-200 hover:bg-green-300 dark:bg-green-800/40 dark:hover:bg-green-800/60",
  heavy: "bg-green-300 hover:bg-green-400 dark:bg-green-700/50 dark:hover:bg-green-700/70",
};

export function Calendar({
  sessions,
  initialYear,
  initialMonth,
  onMonthChange,
}: Props) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  const sessionMap = new Map(sessions.map((s) => [s.date, s]));

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const workoutDays = sessions.filter(
      (s) => s.exercises.length > 0 && !s.isRestDay
    ).length;
    const totalSets = sessions.reduce(
      (acc, s) =>
        acc +
        s.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0),
      0
    );
    return { workoutDays, totalSets };
  }, [sessions]);

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setMonth(newMonth);
    setYear(newYear);
    onMonthChange(newYear, newMonth);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
    onMonthChange(newYear, newMonth);
  };

  // Generate calendar grid
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {year}年{month}月
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* Monthly summary */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Dumbbell className="size-4" />
          <span>{monthlyStats.workoutDays}日</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Flame className="size-4" />
          <span>{monthlyStats.totalSets}セット</span>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted-foreground">
        {DAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              "py-2 font-medium",
              i === 0 && "text-red-500",
              i === 6 && "text-blue-500"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateKey = formatDateKey(year, month, day);
          const session = sessionMap.get(dateKey);
          const isToday = dateKey === todayKey;
          const hasWorkout = session && session.exercises.length > 0;
          const isRestDay = session?.isRestDay;
          const dayOfWeek = (firstDay + day - 1) % 7;
          const intensity = getWorkoutIntensity(session);

          return (
            <Link
              key={day}
              href={`/session/${dateKey}`}
              prefetch={true}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg text-sm",
                "transition-transform duration-100 ease-out",
                "hover:scale-105 active:scale-95",
                isToday && "ring-2 ring-primary ring-offset-2",
                isRestDay && "bg-muted/50 hover:bg-muted",
                !isRestDay && intensityColors[intensity]
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  dayOfWeek === 0 && "text-red-500",
                  dayOfWeek === 6 && "text-blue-500"
                )}
              >
                {day}
              </span>
              {session?.preset && (
                <span className="text-[10px] text-muted-foreground truncate max-w-full px-1 leading-tight">
                  {session.preset.name}
                </span>
              )}
              {hasWorkout && !session?.preset && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-green-100 dark:bg-green-900/30" />
          <span>軽め</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-green-200 dark:bg-green-800/40" />
          <span>中程度</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-green-300 dark:bg-green-700/50" />
          <span>ハード</span>
        </div>
      </div>
    </div>
  );
}
