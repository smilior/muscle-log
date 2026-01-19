"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { MediaGallery } from "@/components/session/media-gallery";
import {
  Dumbbell,
  Clock,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Image as ImageIcon,
  Youtube,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ExerciseSet = {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
};

type Media = {
  id: string;
  url: string;
  type: string;
};

type ExerciseVideo = {
  id: string;
  youtubeUrl: string;
  title: string | null;
};

type SessionExercise = {
  id: string;
  order: number;
  memo: string | null;
  durationMinutes: number | null;
  exercise: {
    id: string;
    name: string;
    type: string;
    videos?: ExerciseVideo[];
  };
  sets: ExerciseSet[];
  media: Media[];
};

type Props = {
  sessionExercise: SessionExercise;
  onRemove: (id: string) => Promise<void>;
  onAddSet: (sessionExerciseId: string) => Promise<void>;
  onUpdateSet: (
    setId: string,
    field: "weight" | "reps" | "rpe",
    value: string
  ) => Promise<void>;
  onRemoveSet: (setId: string) => Promise<void>;
  onUpdateDuration: (sessionExerciseId: string, value: string) => Promise<void>;
};

function getRpeColor(rpe: number | null): string {
  if (rpe === null) return "";
  if (rpe <= 6) return "text-green-600 bg-green-50";
  if (rpe <= 8) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? match[1] : null;
}

export function ExerciseCard({
  sessionExercise: se,
  onRemove,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onUpdateDuration,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRemoving, startRemoveTransition] = useTransition();
  const [isAddingSet, startAddSetTransition] = useTransition();
  const [removingSetId, setRemovingSetId] = useState<string | null>(null);
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({});
  const [playingVideo, setPlayingVideo] = useState<ExerciseVideo | null>(null);

  const handleRemove = () => {
    startRemoveTransition(async () => {
      await onRemove(se.id);
    });
  };

  const handleAddSet = () => {
    startAddSetTransition(async () => {
      await onAddSet(se.id);
    });
  };

  const handleRemoveSet = async (setId: string) => {
    setRemovingSetId(setId);
    await onRemoveSet(setId);
    setRemovingSetId(null);
  };

  const handleUpdateSet = async (
    setId: string,
    field: "weight" | "reps" | "rpe",
    value: string
  ) => {
    await onUpdateSet(setId, field, value);
    const key = `${setId}-${field}`;
    setSavedFields((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSavedFields((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  };

  const allSetsComplete = se.sets.every(
    (set) => set.weight !== null && set.reps !== null
  );

  const videos = se.exercise.videos || [];

  return (
    <>
      <Card className={cn(isRemoving && "opacity-50")}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-2 text-left flex-1"
            >
              <CardTitle className="text-lg flex items-center gap-2">
                {se.exercise.type === "strength" ? (
                  <Dumbbell className="size-4" />
                ) : (
                  <Clock className="size-4" />
                )}
                {se.exercise.name}
              </CardTitle>
              {allSetsComplete && se.sets.length > 0 && (
                <Check className="size-4 text-green-600" />
              )}
              {/* Media icon - temporarily hidden
              {se.media.length > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <ImageIcon className="size-3" />
                  {se.media.length}
                </span>
              )}
              */}
              {videos.length > 0 && (
                <Youtube className="size-4 text-red-500" />
              )}
              {isCollapsed ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="size-4 text-muted-foreground" />
              )}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? <Spinner size="sm" /> : <X className="size-4" />}
            </Button>
          </div>
          {isCollapsed && se.sets.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {se.sets.length}セット完了
            </p>
          )}
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="space-y-4">
            {/* Reference videos */}
            {videos.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium">
                  参考動画
                </div>
                <div className="flex flex-wrap gap-2">
                  {videos.map((video) => {
                    const videoId = getYouTubeVideoId(video.youtubeUrl);
                    return (
                      <button
                        key={video.id}
                        onClick={() => setPlayingVideo(video)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-sm text-left"
                      >
                        {videoId ? (
                          <div className="relative w-12 h-9 shrink-0">
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                              alt=""
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="size-4 text-white drop-shadow-lg" fill="white" />
                            </div>
                          </div>
                        ) : (
                          <Play className="size-4 text-red-500" />
                        )}
                        <span className="text-red-700 truncate max-w-[120px]">
                          {video.title || "動画を見る"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {se.exercise.type === "strength" ? (
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 text-xs text-muted-foreground px-2">
                  <div className="w-6"></div>
                  <div>重量(kg)</div>
                  <div>回数</div>
                  <div>RPE</div>
                  <div className="w-8"></div>
                </div>
                {/* Sets */}
                {se.sets.map((set) => (
                  <div
                    key={set.id}
                    className={cn(
                      "grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center",
                      removingSetId === set.id && "opacity-50"
                    )}
                  >
                    <div className="w-6 text-sm text-muted-foreground font-medium">
                      {set.setNumber}
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        inputMode="decimal"
                        defaultValue={set.weight ?? ""}
                        onBlur={(e) =>
                          handleUpdateSet(set.id, "weight", e.target.value)
                        }
                        className="h-11 text-base"
                        step="0.5"
                      />
                      {savedFields[`${set.id}-weight`] && (
                        <Check className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-green-600" />
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        inputMode="numeric"
                        defaultValue={set.reps ?? ""}
                        onBlur={(e) =>
                          handleUpdateSet(set.id, "reps", e.target.value)
                        }
                        className="h-11 text-base"
                      />
                      {savedFields[`${set.id}-reps`] && (
                        <Check className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-green-600" />
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        inputMode="numeric"
                        defaultValue={set.rpe ?? ""}
                        onBlur={(e) =>
                          handleUpdateSet(set.id, "rpe", e.target.value)
                        }
                        className={cn("h-11 text-base font-medium", getRpeColor(set.rpe))}
                        min="1"
                        max="10"
                      />
                      {savedFields[`${set.id}-rpe`] && (
                        <Check className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-green-600" />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleRemoveSet(set.id)}
                      disabled={removingSetId === set.id}
                    >
                      {removingSetId === set.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <X className="size-3" />
                      )}
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddSet}
                  disabled={isAddingSet}
                  className="w-full"
                >
                  {isAddingSet ? (
                    <Spinner size="sm" className="mr-1" />
                  ) : (
                    <Plus className="size-4 mr-1" />
                  )}
                  セット追加
                </Button>
              </div>
            ) : (
              /* Cardio */
              <div className="flex items-center gap-2">
                <span className="text-sm">時間:</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  defaultValue={se.durationMinutes ?? ""}
                  onBlur={(e) => onUpdateDuration(se.id, e.target.value)}
                  className="w-24 h-11 text-base"
                />
                <span className="text-sm">分</span>
              </div>
            )}

            {/* Media Gallery - temporarily hidden
            {se.media.length > 0 && (
              <div className="pt-2 border-t">
                <MediaGallery
                  sessionExerciseId={se.id}
                  media={se.media}
                />
              </div>
            )}
            */}
          </CardContent>
        )}
      </Card>

      {/* YouTube Video Modal */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setPlayingVideo(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => setPlayingVideo(null)}
          >
            <X className="size-6" />
          </Button>

          <div
            className="w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {getYouTubeVideoId(playingVideo.youtubeUrl) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(playingVideo.youtubeUrl)}?autoplay=1&rel=0`}
                title={playingVideo.title || "YouTube video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                動画を読み込めませんでした
              </div>
            )}
          </div>

          {playingVideo.title && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-lg font-medium">
                {playingVideo.title}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
