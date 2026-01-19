import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Better Auth用テーブル（必須）
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ==========================================
// Muscle Log テーブル
// ==========================================

// 種目マスタ
export const exercise = sqliteTable("exercise", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'strength' | 'cardio'
  bodyPart: text("body_part"), // 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core'
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 種目の参考YouTube動画
export const exerciseVideo = sqliteTable("exercise_video", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercise.id, { onDelete: "cascade" }),
  youtubeUrl: text("youtube_url").notNull(),
  title: text("title"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// プリセット（テンプレート）
export const preset = sqliteTable("preset", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// プリセットの種目
export const presetExercise = sqliteTable("preset_exercise", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  presetId: text("preset_id")
    .notNull()
    .references(() => preset.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercise.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
});

// トレーニングセッション
export const workoutSession = sqliteTable("workout_session", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  date: text("date").notNull(), // YYYY-MM-DD
  presetId: text("preset_id").references(() => preset.id),
  memo: text("memo"),
  isRestDay: integer("is_rest_day", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// セッション内の種目記録
export const sessionExercise = sqliteTable("session_exercise", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id")
    .notNull()
    .references(() => workoutSession.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercise.id),
  order: integer("order").notNull(),
  memo: text("memo"),
  durationMinutes: integer("duration_minutes"), // 有酸素用
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// セット記録（筋トレ用）
export const exerciseSet = sqliteTable("exercise_set", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionExerciseId: text("session_exercise_id")
    .notNull()
    .references(() => sessionExercise.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  weight: real("weight"), // kg
  reps: integer("reps"),
  rpe: integer("rpe"), // 1-10
});

// 種目の写真・動画
export const exerciseMedia = sqliteTable("exercise_media", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionExerciseId: text("session_exercise_id")
    .notNull()
    .references(() => sessionExercise.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'image' | 'video'
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ==========================================
// リレーション定義
// ==========================================

export const exerciseRelations = relations(exercise, ({ one, many }) => ({
  user: one(user, { fields: [exercise.userId], references: [user.id] }),
  videos: many(exerciseVideo),
  presetExercises: many(presetExercise),
  sessionExercises: many(sessionExercise),
}));

export const exerciseVideoRelations = relations(exerciseVideo, ({ one }) => ({
  exercise: one(exercise, { fields: [exerciseVideo.exerciseId], references: [exercise.id] }),
}));

export const presetRelations = relations(preset, ({ one, many }) => ({
  user: one(user, { fields: [preset.userId], references: [user.id] }),
  exercises: many(presetExercise),
  sessions: many(workoutSession),
}));

export const presetExerciseRelations = relations(presetExercise, ({ one }) => ({
  preset: one(preset, { fields: [presetExercise.presetId], references: [preset.id] }),
  exercise: one(exercise, { fields: [presetExercise.exerciseId], references: [exercise.id] }),
}));

export const workoutSessionRelations = relations(workoutSession, ({ one, many }) => ({
  user: one(user, { fields: [workoutSession.userId], references: [user.id] }),
  preset: one(preset, { fields: [workoutSession.presetId], references: [preset.id] }),
  exercises: many(sessionExercise),
}));

export const sessionExerciseRelations = relations(sessionExercise, ({ one, many }) => ({
  session: one(workoutSession, { fields: [sessionExercise.sessionId], references: [workoutSession.id] }),
  exercise: one(exercise, { fields: [sessionExercise.exerciseId], references: [exercise.id] }),
  sets: many(exerciseSet),
  media: many(exerciseMedia),
}));

export const exerciseSetRelations = relations(exerciseSet, ({ one }) => ({
  sessionExercise: one(sessionExercise, { fields: [exerciseSet.sessionExerciseId], references: [sessionExercise.id] }),
}));

export const exerciseMediaRelations = relations(exerciseMedia, ({ one }) => ({
  sessionExercise: one(sessionExercise, { fields: [exerciseMedia.sessionExerciseId], references: [sessionExercise.id] }),
}));
