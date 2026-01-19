# Muscle Log 詳細設計

## 1. データベース設計

### 1.1 ER図（概念）

```
[user] 1--* [workout_session] 1--* [session_exercise] *--1 [exercise]
                                         |
                                         *--* [exercise_set]
                                         *--* [exercise_media]

[exercise] 1--* [exercise_video]

[preset] 1--* [preset_exercise] *--1 [exercise]
```

### 1.2 テーブル定義

#### exercise（種目マスタ）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | text | PK |
| name | text | 種目名（ダンベルプレス等） |
| type | text | 'strength' / 'cardio' |
| body_part | text | 対象部位（chest, back, legs, shoulders, arms, core） |
| user_id | text | FK → user.id |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

#### exercise_video（種目の参考動画）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | text | PK |
| exercise_id | text | FK → exercise.id |
| youtube_url | text | YouTube URL |
| title | text | 動画タイトル（任意） |
| created_at | timestamp | 作成日時 |

#### preset（プリセット）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | text | PK |
| name | text | プリセット名（胸の日等） |
| user_id | text | FK → user.id |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

#### preset_exercise（プリセットの種目）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | text | PK |
| preset_id | text | FK → preset.id |
| exercise_id | text | FK → exercise.id |
| order | integer | 表示順序 |

#### workout_session（トレーニングセッション）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | text | PK |
| user_id | text | FK → user.id |
| date | text | 日付（YYYY-MM-DD） |
| preset_id | text | FK → preset.id（任意） |
| memo | text | セッションメモ |
| is_rest_day | boolean | 休息日フラグ |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

#### session_exercise（セッション内の種目記録）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | text | PK |
| session_id | text | FK → workout_session.id |
| exercise_id | text | FK → exercise.id |
| order | integer | 表示順序 |
| memo | text | 種目メモ（フォームの意識点等） |
| duration_minutes | integer | 有酸素の場合の時間（分） |
| created_at | timestamp | 作成日時 |

#### exercise_set（セット記録 - 筋トレ用）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | text | PK |
| session_exercise_id | text | FK → session_exercise.id |
| set_number | integer | セット番号 |
| weight | real | 重量（kg） |
| reps | integer | 回数 |
| rpe | integer | RPE（1-10、任意） |

#### exercise_media（種目の写真・動画）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | text | PK |
| session_exercise_id | text | FK → session_exercise.id |
| url | text | メディアURL |
| type | text | 'image' / 'video' |
| created_at | timestamp | 作成日時 |

## 2. 画面設計

### 2.1 画面一覧

| 画面 | パス | 説明 |
|------|------|------|
| カレンダー（ホーム） | /dashboard | 月間カレンダー表示 |
| セッション詳細 | /session/[date] | 日付のトレーニング記録・編集 |
| 種目マスタ一覧 | /exercises | 種目の一覧・管理 |
| 種目詳細 | /exercises/[id] | 種目の編集・履歴・YouTube |
| プリセット一覧 | /presets | プリセットの一覧・管理 |
| プリセット編集 | /presets/[id] | プリセットの編集 |

### 2.2 画面フロー

```
[カレンダー] → [日付タップ] → [セッション詳細]
     ↓                              ↓
[種目マスタ] ←────────────── [種目追加]
     ↓
[種目詳細] → [履歴表示]

[プリセット一覧] → [プリセット編集]
```

## 3. API設計（Server Actions）

Next.js App RouterのServer Actionsを使用。

### 3.1 種目マスタ

- `getExercises()` - 一覧取得
- `getExercise(id)` - 詳細取得
- `createExercise(data)` - 作成
- `updateExercise(id, data)` - 更新
- `deleteExercise(id)` - 削除
- `addExerciseVideo(exerciseId, url)` - YouTube追加
- `removeExerciseVideo(videoId)` - YouTube削除

### 3.2 プリセット

- `getPresets()` - 一覧取得
- `getPreset(id)` - 詳細取得
- `createPreset(data)` - 作成
- `updatePreset(id, data)` - 更新
- `deletePreset(id)` - 削除

### 3.3 トレーニングセッション

- `getSession(date)` - 日付でセッション取得
- `getSessionsForMonth(year, month)` - 月のセッション一覧
- `createOrUpdateSession(date, data)` - セッション作成・更新
- `applyPreset(date, presetId)` - プリセット適用
- `addExerciseToSession(sessionId, exerciseId)` - 種目追加
- `updateSessionExercise(id, data)` - 種目記録更新
- `removeExerciseFromSession(id)` - 種目削除

### 3.4 セット記録

- `addSet(sessionExerciseId, data)` - セット追加
- `updateSet(setId, data)` - セット更新
- `removeSet(setId)` - セット削除

### 3.5 メディア

- `uploadMedia(sessionExerciseId, file)` - アップロード
- `deleteMedia(mediaId)` - 削除
- `getExerciseMediaHistory(exerciseId)` - 種目の全メディア履歴

## 4. コンポーネント設計

### 4.1 共通コンポーネント

- `Calendar` - カレンダー表示
- `ExerciseCard` - 種目カード
- `SetInput` - セット入力（重量×回数）
- `YouTubeEmbed` - YouTube埋め込み
- `MediaUploader` - 写真・動画アップロード

### 4.2 ページコンポーネント

- `DashboardPage` - カレンダー + 今日のセッション
- `SessionPage` - セッション詳細・編集
- `ExercisesPage` - 種目マスタ一覧
- `ExerciseDetailPage` - 種目詳細・履歴
- `PresetsPage` - プリセット一覧
- `PresetEditPage` - プリセット編集

## 5. ファイル構成

```
src/
├── app/
│   ├── (protected)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── session/
│   │   │   └── [date]/
│   │   │       └── page.tsx
│   │   ├── exercises/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── presets/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   └── ...
├── lib/
│   ├── db/
│   │   └── schema.ts          # 拡張済み
│   └── actions/
│       ├── exercises.ts
│       ├── presets.ts
│       ├── sessions.ts
│       └── media.ts
└── components/
    ├── calendar/
    │   └── calendar.tsx
    ├── exercises/
    │   ├── exercise-card.tsx
    │   └── exercise-form.tsx
    ├── sessions/
    │   ├── session-exercise.tsx
    │   └── set-input.tsx
    └── presets/
        └── preset-form.tsx
```

## 6. 実装優先順位

1. **Phase 1: 基盤**
   - DBスキーマ拡張
   - 種目マスタCRUD

2. **Phase 2: プリセット**
   - プリセットCRUD
   - 種目の紐づけ

3. **Phase 3: トレーニング記録**
   - セッション作成・編集
   - セット記録
   - プリセット適用

4. **Phase 4: カレンダー**
   - 月間カレンダー表示
   - セッション一覧

5. **Phase 5: 振り返り・メディア**（後回し可）
   - 種目別履歴
   - 写真・動画アップロード
