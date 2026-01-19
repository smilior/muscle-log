"use server";

import { db } from "@/lib/db";
import { exerciseMedia, sessionExercise } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function addExerciseMedia(
  sessionExerciseId: string,
  url: string,
  type: "image" | "video"
) {
  const user = await getUser();

  // Verify ownership
  const se = await db.query.sessionExercise.findFirst({
    where: eq(sessionExercise.id, sessionExerciseId),
    with: { session: true },
  });

  if (!se || se.session.userId !== user.id) {
    throw new Error("Session exercise not found");
  }

  const [media] = await db
    .insert(exerciseMedia)
    .values({
      sessionExerciseId,
      url,
      type,
    })
    .returning();

  revalidatePath(`/session/${se.session.date}`);
  return media;
}

export async function removeExerciseMedia(mediaId: string) {
  const user = await getUser();

  // Get media with session info
  const media = await db.query.exerciseMedia.findFirst({
    where: eq(exerciseMedia.id, mediaId),
    with: {
      sessionExercise: {
        with: { session: true },
      },
    },
  });

  if (!media || media.sessionExercise.session.userId !== user.id) {
    throw new Error("Media not found");
  }

  // Delete from Vercel Blob
  try {
    await del(media.url);
  } catch (error) {
    console.error("Failed to delete blob:", error);
    // Continue with DB deletion even if blob deletion fails
  }

  // Delete from database
  await db.delete(exerciseMedia).where(eq(exerciseMedia.id, mediaId));

  revalidatePath(`/session/${media.sessionExercise.session.date}`);
}

export async function getMediaForSessionExercise(sessionExerciseId: string) {
  const user = await getUser();

  const se = await db.query.sessionExercise.findFirst({
    where: eq(sessionExercise.id, sessionExerciseId),
    with: { session: true, media: true },
  });

  if (!se || se.session.userId !== user.id) {
    throw new Error("Session exercise not found");
  }

  return se.media;
}
