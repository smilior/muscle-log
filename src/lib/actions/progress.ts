"use server";

import { db } from "@/lib/db";
import {
  workoutSession,
  sessionExercise,
  exerciseSet,
  exercise,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, asc, desc } from "drizzle-orm";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export type ExerciseHistoryEntry = {
  date: string;
  sets: {
    setNumber: number;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
  }[];
  maxWeight: number | null;
  totalVolume: number; // weight * reps
  estimatedOneRM: number | null; // Brzycki formula
};

export type ExerciseProgress = {
  exercise: {
    id: string;
    name: string;
    type: string;
    bodyPart: string | null;
  };
  history: ExerciseHistoryEntry[];
  stats: {
    totalSessions: number;
    currentMaxWeight: number | null;
    allTimeMaxWeight: number | null;
    currentEstimatedOneRM: number | null;
    allTimeMaxOneRM: number | null;
    weightProgress: number | null; // percentage change
    volumeProgress: number | null; // percentage change
  };
};

// Brzycki formula for estimated 1RM
function calculateOneRM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) return weight * (1 + reps / 30); // Less accurate for high reps
  return weight * (36 / (37 - reps));
}

export async function getExerciseProgress(exerciseId: string): Promise<ExerciseProgress | null> {
  const user = await getUser();

  // Get exercise details
  const exerciseData = await db.query.exercise.findFirst({
    where: and(
      eq(exercise.id, exerciseId),
      eq(exercise.userId, user.id)
    ),
  });

  if (!exerciseData) return null;

  // Get all sessions with this exercise
  const sessions = await db.query.workoutSession.findMany({
    where: eq(workoutSession.userId, user.id),
    with: {
      exercises: {
        where: eq(sessionExercise.exerciseId, exerciseId),
        with: {
          sets: {
            orderBy: [asc(exerciseSet.setNumber)],
          },
        },
      },
    },
    orderBy: [desc(workoutSession.date)],
  });

  // Filter sessions that have this exercise with sets
  const relevantSessions = sessions.filter(
    (s) => s.exercises.length > 0 && s.exercises[0].sets.length > 0
  );

  if (relevantSessions.length === 0) {
    return {
      exercise: exerciseData,
      history: [],
      stats: {
        totalSessions: 0,
        currentMaxWeight: null,
        allTimeMaxWeight: null,
        currentEstimatedOneRM: null,
        allTimeMaxOneRM: null,
        weightProgress: null,
        volumeProgress: null,
      },
    };
  }

  // Build history
  const history: ExerciseHistoryEntry[] = relevantSessions.map((session) => {
    const sets = session.exercises[0].sets;

    let maxWeight: number | null = null;
    let totalVolume = 0;
    let maxOneRM: number | null = null;

    sets.forEach((set) => {
      if (set.weight !== null) {
        if (maxWeight === null || set.weight > maxWeight) {
          maxWeight = set.weight;
        }
        if (set.reps !== null && set.reps > 0) {
          totalVolume += set.weight * set.reps;
          const oneRM = calculateOneRM(set.weight, set.reps);
          if (maxOneRM === null || oneRM > maxOneRM) {
            maxOneRM = oneRM;
          }
        }
      }
    });

    return {
      date: session.date,
      sets: sets.map((s) => ({
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
      })),
      maxWeight,
      totalVolume,
      estimatedOneRM: maxOneRM ? Math.round(maxOneRM * 10) / 10 : null,
    };
  });

  // Calculate stats
  const allTimeMaxWeight = Math.max(
    ...history.map((h) => h.maxWeight ?? 0)
  );
  const allTimeMaxOneRM = Math.max(
    ...history.map((h) => h.estimatedOneRM ?? 0)
  );

  const currentEntry = history[0];
  const oldestEntries = history.slice(-3); // Last 3 entries for comparison
  const recentEntries = history.slice(0, 3); // First 3 entries (most recent)

  const avgOldWeight = oldestEntries.reduce((acc, h) => acc + (h.maxWeight ?? 0), 0) / oldestEntries.length;
  const avgRecentWeight = recentEntries.reduce((acc, h) => acc + (h.maxWeight ?? 0), 0) / recentEntries.length;

  const avgOldVolume = oldestEntries.reduce((acc, h) => acc + h.totalVolume, 0) / oldestEntries.length;
  const avgRecentVolume = recentEntries.reduce((acc, h) => acc + h.totalVolume, 0) / recentEntries.length;

  const weightProgress = avgOldWeight > 0
    ? Math.round(((avgRecentWeight - avgOldWeight) / avgOldWeight) * 100 * 10) / 10
    : null;

  const volumeProgress = avgOldVolume > 0
    ? Math.round(((avgRecentVolume - avgOldVolume) / avgOldVolume) * 100 * 10) / 10
    : null;

  return {
    exercise: exerciseData,
    history: history.reverse(), // Chronological order for charts
    stats: {
      totalSessions: relevantSessions.length,
      currentMaxWeight: currentEntry?.maxWeight ?? null,
      allTimeMaxWeight: allTimeMaxWeight > 0 ? allTimeMaxWeight : null,
      currentEstimatedOneRM: currentEntry?.estimatedOneRM ?? null,
      allTimeMaxOneRM: allTimeMaxOneRM > 0 ? Math.round(allTimeMaxOneRM * 10) / 10 : null,
      weightProgress,
      volumeProgress,
    },
  };
}

export async function getAllExercisesWithProgress() {
  const user = await getUser();

  // Get all exercises
  const exercises = await db.query.exercise.findMany({
    where: eq(exercise.userId, user.id),
    orderBy: [asc(exercise.name)],
  });

  // Get summary stats for each exercise
  const exercisesWithStats = await Promise.all(
    exercises.map(async (ex) => {
      const progress = await getExerciseProgress(ex.id);
      return {
        ...ex,
        sessionCount: progress?.stats.totalSessions ?? 0,
        maxWeight: progress?.stats.allTimeMaxWeight ?? null,
        maxOneRM: progress?.stats.allTimeMaxOneRM ?? null,
        weightProgress: progress?.stats.weightProgress ?? null,
      };
    })
  );

  // Sort by most used
  return exercisesWithStats.sort((a, b) => b.sessionCount - a.sessionCount);
}
