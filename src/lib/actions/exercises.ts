"use server";

import { db } from "@/lib/db";
import { exercise, exerciseVideo } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function getExercises() {
  const user = await getUser();
  return db.query.exercise.findMany({
    where: eq(exercise.userId, user.id),
    orderBy: (exercise, { asc }) => [asc(exercise.name)],
    with: {
      videos: true,
    },
  });
}

export async function getExercise(id: string) {
  const user = await getUser();
  return db.query.exercise.findFirst({
    where: and(eq(exercise.id, id), eq(exercise.userId, user.id)),
    with: {
      videos: true,
    },
  });
}

export async function createExercise(data: {
  name: string;
  type: "strength" | "cardio";
  bodyPart?: string;
}) {
  const user = await getUser();
  const [newExercise] = await db
    .insert(exercise)
    .values({
      name: data.name,
      type: data.type,
      bodyPart: data.bodyPart,
      userId: user.id,
    })
    .returning();
  revalidatePath("/exercises");
  return newExercise;
}

export async function updateExercise(
  id: string,
  data: {
    name?: string;
    type?: "strength" | "cardio";
    bodyPart?: string;
  }
) {
  const user = await getUser();
  const [updated] = await db
    .update(exercise)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(exercise.id, id), eq(exercise.userId, user.id)))
    .returning();
  revalidatePath("/exercises");
  revalidatePath(`/exercises/${id}`);
  return updated;
}

export async function deleteExercise(id: string) {
  const user = await getUser();
  await db
    .delete(exercise)
    .where(and(eq(exercise.id, id), eq(exercise.userId, user.id)));
  revalidatePath("/exercises");
}

export async function addExerciseVideo(
  exerciseId: string,
  youtubeUrl: string,
  title?: string
) {
  const user = await getUser();
  // Verify ownership
  const ex = await db.query.exercise.findFirst({
    where: and(eq(exercise.id, exerciseId), eq(exercise.userId, user.id)),
  });
  if (!ex) throw new Error("Exercise not found");

  const [video] = await db
    .insert(exerciseVideo)
    .values({
      exerciseId,
      youtubeUrl,
      title,
    })
    .returning();
  revalidatePath(`/exercises/${exerciseId}`);
  return video;
}

export async function removeExerciseVideo(videoId: string) {
  const user = await getUser();
  // Verify ownership through exercise
  const video = await db.query.exerciseVideo.findFirst({
    where: eq(exerciseVideo.id, videoId),
    with: { exercise: true },
  });
  if (!video || video.exercise.userId !== user.id) {
    throw new Error("Video not found");
  }

  await db.delete(exerciseVideo).where(eq(exerciseVideo.id, videoId));
  revalidatePath(`/exercises/${video.exerciseId}`);
}
