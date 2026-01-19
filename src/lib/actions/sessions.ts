"use server";

import { db } from "@/lib/db";
import {
  workoutSession,
  sessionExercise,
  exerciseSet,
  exercise,
  presetExercise,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, asc, between, desc, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

// Helper: Get last sets for a specific exercise
async function getLastSetsForExercise(userId: string, exerciseId: string, beforeDate?: string) {
  // Find the most recent session with this exercise
  const lastSessionExercise = await db.query.sessionExercise.findFirst({
    where: eq(sessionExercise.exerciseId, exerciseId),
    with: {
      session: true,
      sets: {
        orderBy: [asc(exerciseSet.setNumber)],
      },
    },
    orderBy: [desc(sessionExercise.createdAt)],
  });

  // Verify ownership and check date
  if (
    !lastSessionExercise ||
    lastSessionExercise.session.userId !== userId ||
    (beforeDate && lastSessionExercise.session.date >= beforeDate)
  ) {
    // Try to find an older one if date filter applies
    if (beforeDate && lastSessionExercise) {
      const olderSessions = await db.query.workoutSession.findMany({
        where: and(
          eq(workoutSession.userId, userId),
          lt(workoutSession.date, beforeDate)
        ),
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
        limit: 1,
      });

      const found = olderSessions.find((s) => s.exercises.length > 0);
      if (found && found.exercises[0].sets.length > 0) {
        return found.exercises[0].sets;
      }
    }
    return null;
  }

  return lastSessionExercise.sets.length > 0 ? lastSessionExercise.sets : null;
}

// Helper: Copy sets to a new session exercise
async function copySetsToSessionExercise(
  newSessionExerciseId: string,
  previousSets: { weight: number | null; reps: number | null; rpe: number | null }[]
) {
  for (let i = 0; i < previousSets.length; i++) {
    const prevSet = previousSets[i];
    await db.insert(exerciseSet).values({
      sessionExerciseId: newSessionExerciseId,
      setNumber: i + 1,
      weight: prevSet.weight,
      reps: prevSet.reps,
      rpe: prevSet.rpe,
    });
  }
}

export async function getSession(date: string) {
  const user = await getUser();
  return db.query.workoutSession.findFirst({
    where: and(
      eq(workoutSession.userId, user.id),
      eq(workoutSession.date, date)
    ),
    with: {
      preset: true,
      exercises: {
        orderBy: [asc(sessionExercise.order)],
        with: {
          exercise: {
            with: {
              videos: true,
            },
          },
          sets: {
            orderBy: [asc(exerciseSet.setNumber)],
          },
          media: true,
        },
      },
    },
  });
}

export async function getSessionsForMonth(year: number, month: number) {
  const user = await getUser();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  return db.query.workoutSession.findMany({
    where: and(
      eq(workoutSession.userId, user.id),
      between(workoutSession.date, startDate, endDate)
    ),
    with: {
      preset: true,
      exercises: {
        with: {
          exercise: true,
          sets: true,
        },
      },
    },
  });
}

export async function createOrUpdateSession(
  date: string,
  data: {
    presetId?: string | null;
    memo?: string;
    isRestDay?: boolean;
  }
) {
  const user = await getUser();

  const existing = await db.query.workoutSession.findFirst({
    where: and(
      eq(workoutSession.userId, user.id),
      eq(workoutSession.date, date)
    ),
  });

  if (existing) {
    const [updated] = await db
      .update(workoutSession)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(workoutSession.id, existing.id))
      .returning();
    revalidatePath(`/session/${date}`);
    return updated;
  }

  const [created] = await db
    .insert(workoutSession)
    .values({
      userId: user.id,
      date,
      presetId: data.presetId,
      memo: data.memo,
      isRestDay: data.isRestDay ?? false,
    })
    .returning();
  revalidatePath(`/session/${date}`);
  return created;
}

export async function applyPreset(date: string, presetId: string) {
  const user = await getUser();

  // Get or create session
  let session = await db.query.workoutSession.findFirst({
    where: and(
      eq(workoutSession.userId, user.id),
      eq(workoutSession.date, date)
    ),
  });

  if (!session) {
    const [created] = await db
      .insert(workoutSession)
      .values({
        userId: user.id,
        date,
        presetId,
        isRestDay: false,
      })
      .returning();
    session = created;
  } else {
    await db
      .update(workoutSession)
      .set({ presetId, updatedAt: new Date() })
      .where(eq(workoutSession.id, session.id));
  }

  // Get preset exercises
  const presetExercises = await db.query.presetExercise.findMany({
    where: eq(presetExercise.presetId, presetId),
    orderBy: [asc(presetExercise.order)],
  });

  // Get current session exercises count for order
  const currentExercises = await db.query.sessionExercise.findMany({
    where: eq(sessionExercise.sessionId, session.id),
  });
  let nextOrder = currentExercises.length;

  // Add preset exercises to session with previous sets
  for (const pe of presetExercises) {
    // Check if exercise already in session
    const exists = currentExercises.some(
      (se) => se.exerciseId === pe.exerciseId
    );
    if (!exists) {
      // Create session exercise
      const [newSe] = await db.insert(sessionExercise).values({
        sessionId: session.id,
        exerciseId: pe.exerciseId,
        order: nextOrder++,
      }).returning();

      // Copy previous sets
      const previousSets = await getLastSetsForExercise(user.id, pe.exerciseId, date);
      if (previousSets) {
        await copySetsToSessionExercise(newSe.id, previousSets);
      }
    }
  }

  revalidatePath(`/session/${date}`);
  return session;
}

export async function addExerciseToSession(date: string, exerciseId: string) {
  const user = await getUser();

  // Get or create session
  let session = await db.query.workoutSession.findFirst({
    where: and(
      eq(workoutSession.userId, user.id),
      eq(workoutSession.date, date)
    ),
    with: { exercises: true },
  });

  if (!session) {
    const [created] = await db
      .insert(workoutSession)
      .values({
        userId: user.id,
        date,
        isRestDay: false,
      })
      .returning();
    session = { ...created, exercises: [] };
  }

  // Check if already exists
  const exists = session.exercises.some((se) => se.exerciseId === exerciseId);
  if (exists) return;

  // Create session exercise
  const [newSe] = await db.insert(sessionExercise).values({
    sessionId: session.id,
    exerciseId,
    order: session.exercises.length,
  }).returning();

  // Copy previous sets
  const previousSets = await getLastSetsForExercise(user.id, exerciseId, date);
  if (previousSets) {
    await copySetsToSessionExercise(newSe.id, previousSets);
  }

  revalidatePath(`/session/${date}`);
}

export async function updateSessionExercise(
  id: string,
  data: {
    memo?: string | null;
    durationMinutes?: number | null;
  }
) {
  const user = await getUser();

  const se = await db.query.sessionExercise.findFirst({
    where: eq(sessionExercise.id, id),
    with: { session: true },
  });
  if (!se || se.session.userId !== user.id) {
    throw new Error("Session exercise not found");
  }

  // Filter out undefined values, but keep null values
  const updateData: { memo?: string | null; durationMinutes?: number | null } = {};
  if (data.memo !== undefined) updateData.memo = data.memo;
  if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;

  if (Object.keys(updateData).length > 0) {
    await db
      .update(sessionExercise)
      .set(updateData)
      .where(eq(sessionExercise.id, id));
  }

  revalidatePath(`/session/${se.session.date}`);
}

export async function removeExerciseFromSession(id: string) {
  const user = await getUser();

  const se = await db.query.sessionExercise.findFirst({
    where: eq(sessionExercise.id, id),
    with: { session: true },
  });
  if (!se || se.session.userId !== user.id) {
    throw new Error("Session exercise not found");
  }

  await db.delete(sessionExercise).where(eq(sessionExercise.id, id));
  revalidatePath(`/session/${se.session.date}`);
}

// Set management
export async function addSet(
  sessionExerciseId: string,
  data: { weight?: number; reps?: number; rpe?: number }
) {
  const user = await getUser();

  const se = await db.query.sessionExercise.findFirst({
    where: eq(sessionExercise.id, sessionExerciseId),
    with: { session: true, sets: true },
  });
  if (!se || se.session.userId !== user.id) {
    throw new Error("Session exercise not found");
  }

  const setNumber = se.sets.length + 1;

  await db.insert(exerciseSet).values({
    sessionExerciseId,
    setNumber,
    weight: data.weight,
    reps: data.reps,
    rpe: data.rpe,
  });

  revalidatePath(`/session/${se.session.date}`);
}

export async function updateSet(
  setId: string,
  data: { weight?: number | null; reps?: number | null; rpe?: number | null }
) {
  const user = await getUser();

  const set = await db.query.exerciseSet.findFirst({
    where: eq(exerciseSet.id, setId),
    with: {
      sessionExercise: {
        with: { session: true },
      },
    },
  });
  if (!set || set.sessionExercise.session.userId !== user.id) {
    throw new Error("Set not found");
  }

  // Filter out undefined values, but keep null values for clearing fields
  const updateData: { weight?: number | null; reps?: number | null; rpe?: number | null } = {};
  if (data.weight !== undefined) updateData.weight = data.weight;
  if (data.reps !== undefined) updateData.reps = data.reps;
  if (data.rpe !== undefined) updateData.rpe = data.rpe;

  if (Object.keys(updateData).length > 0) {
    await db.update(exerciseSet).set(updateData).where(eq(exerciseSet.id, setId));
  }
  revalidatePath(`/session/${set.sessionExercise.session.date}`);
}

export async function removeSet(setId: string) {
  const user = await getUser();

  const set = await db.query.exerciseSet.findFirst({
    where: eq(exerciseSet.id, setId),
    with: {
      sessionExercise: {
        with: { session: true },
      },
    },
  });
  if (!set || set.sessionExercise.session.userId !== user.id) {
    throw new Error("Set not found");
  }

  await db.delete(exerciseSet).where(eq(exerciseSet.id, setId));
  revalidatePath(`/session/${set.sessionExercise.session.date}`);
}

export async function deleteSession(date: string) {
  const user = await getUser();

  const session = await db.query.workoutSession.findFirst({
    where: and(
      eq(workoutSession.userId, user.id),
      eq(workoutSession.date, date)
    ),
  });

  if (!session) {
    throw new Error("Session not found");
  }

  await db.delete(workoutSession).where(eq(workoutSession.id, session.id));
  revalidatePath(`/session/${date}`);
  revalidatePath("/dashboard");
}
