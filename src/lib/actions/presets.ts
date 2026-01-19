"use server";

import { db } from "@/lib/db";
import { preset, presetExercise, exercise } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function getPresets() {
  const user = await getUser();
  return db.query.preset.findMany({
    where: eq(preset.userId, user.id),
    orderBy: [asc(preset.name)],
    with: {
      exercises: {
        orderBy: [asc(presetExercise.order)],
        with: {
          exercise: true,
        },
      },
    },
  });
}

export async function getPreset(id: string) {
  const user = await getUser();
  return db.query.preset.findFirst({
    where: and(eq(preset.id, id), eq(preset.userId, user.id)),
    with: {
      exercises: {
        orderBy: [asc(presetExercise.order)],
        with: {
          exercise: true,
        },
      },
    },
  });
}

export async function createPreset(data: { name: string }) {
  const user = await getUser();
  const [newPreset] = await db
    .insert(preset)
    .values({
      name: data.name,
      userId: user.id,
    })
    .returning();
  revalidatePath("/presets");
  return newPreset;
}

export async function updatePreset(id: string, data: { name: string }) {
  const user = await getUser();
  const [updated] = await db
    .update(preset)
    .set({
      name: data.name,
      updatedAt: new Date(),
    })
    .where(and(eq(preset.id, id), eq(preset.userId, user.id)))
    .returning();
  revalidatePath("/presets");
  revalidatePath(`/presets/${id}`);
  return updated;
}

export async function deletePreset(id: string) {
  const user = await getUser();
  await db
    .delete(preset)
    .where(and(eq(preset.id, id), eq(preset.userId, user.id)));
  revalidatePath("/presets");
}

export async function addExerciseToPreset(presetId: string, exerciseId: string) {
  const user = await getUser();

  // Verify preset ownership
  const p = await db.query.preset.findFirst({
    where: and(eq(preset.id, presetId), eq(preset.userId, user.id)),
    with: { exercises: true },
  });
  if (!p) throw new Error("Preset not found");

  // Verify exercise ownership
  const ex = await db.query.exercise.findFirst({
    where: and(eq(exercise.id, exerciseId), eq(exercise.userId, user.id)),
  });
  if (!ex) throw new Error("Exercise not found");

  // Get next order
  const nextOrder = p.exercises.length;

  await db.insert(presetExercise).values({
    presetId,
    exerciseId,
    order: nextOrder,
  });

  revalidatePath(`/presets/${presetId}`);
}

export async function addExercisesToPreset(presetId: string, exerciseIds: string[]) {
  const user = await getUser();

  // Verify preset ownership
  const p = await db.query.preset.findFirst({
    where: and(eq(preset.id, presetId), eq(preset.userId, user.id)),
    with: { exercises: true },
  });
  if (!p) throw new Error("Preset not found");

  let nextOrder = p.exercises.length;

  for (const exerciseId of exerciseIds) {
    // Check if already in preset
    const exists = p.exercises.some((pe) => pe.exerciseId === exerciseId);
    if (exists) continue;

    // Verify exercise ownership
    const ex = await db.query.exercise.findFirst({
      where: and(eq(exercise.id, exerciseId), eq(exercise.userId, user.id)),
    });
    if (!ex) continue;

    await db.insert(presetExercise).values({
      presetId,
      exerciseId,
      order: nextOrder++,
    });
  }

  revalidatePath(`/presets/${presetId}`);
}

export async function removeExerciseFromPreset(presetExerciseId: string) {
  const user = await getUser();

  // Verify ownership through preset
  const pe = await db.query.presetExercise.findFirst({
    where: eq(presetExercise.id, presetExerciseId),
    with: { preset: true },
  });
  if (!pe || pe.preset.userId !== user.id) {
    throw new Error("Preset exercise not found");
  }

  await db.delete(presetExercise).where(eq(presetExercise.id, presetExerciseId));
  revalidatePath(`/presets/${pe.presetId}`);
}

export async function reorderPresetExercises(
  presetId: string,
  exerciseIds: string[]
) {
  const user = await getUser();

  // Verify preset ownership
  const p = await db.query.preset.findFirst({
    where: and(eq(preset.id, presetId), eq(preset.userId, user.id)),
    with: { exercises: true },
  });
  if (!p) throw new Error("Preset not found");

  // Update order for each exercise
  for (let i = 0; i < exerciseIds.length; i++) {
    const pe = p.exercises.find((e) => e.id === exerciseIds[i]);
    if (pe) {
      await db
        .update(presetExercise)
        .set({ order: i })
        .where(eq(presetExercise.id, pe.id));
    }
  }

  revalidatePath(`/presets/${presetId}`);
}
