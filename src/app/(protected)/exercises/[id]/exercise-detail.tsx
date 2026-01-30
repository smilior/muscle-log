"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import {
  deleteExercise,
  addExerciseVideo,
  removeExerciseVideo,
} from "@/lib/actions/exercises";
import { ArrowLeft, Pencil, Trash2, Plus, Youtube, X } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  type: string;
  bodyPart: string | null;
  videos: { id: string; youtubeUrl: string; title: string | null }[];
};

type Props = {
  exercise: Exercise;
};

export function ExerciseDetail({ exercise }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  const handleDelete = async () => {
    await deleteExercise(exercise.id);
    router.push("/exercises");
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsAddingVideo(true);
    try {
      await addExerciseVideo(exercise.id, videoUrl.trim(), videoTitle.trim() || undefined);
      setVideoUrl("");
      setVideoTitle("");
      router.refresh();
    } finally {
      setIsAddingVideo(false);
    }
  };

  const handleRemoveVideo = async (videoId: string) => {
    await removeExerciseVideo(videoId);
    router.refresh();
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed|v|shorts|live)\/|youtube\.com\/.*[?&]v=)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/exercises">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1">{exercise.name}</h1>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Pencil className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>種目を編集</DialogTitle>
            </DialogHeader>
            <ExerciseForm
              exercise={exercise}
              onSuccess={() => {
                setEditOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>種目を削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。関連する記録も削除される可能性があります。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Youtube className="size-5" />
            参考動画
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddVideo} className="space-y-2">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube URL"
            />
            <Input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="タイトル（任意）"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isAddingVideo || !videoUrl.trim()}
            >
              <Plus className="mr-2 size-4" />
              動画を追加
            </Button>
          </form>

          {exercise.videos.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              {exercise.videos.map((video) => {
                const embedUrl = getYoutubeEmbedUrl(video.youtubeUrl);
                return (
                  <div key={video.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {video.title || "動画"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleRemoveVideo(video.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    {embedUrl && (
                      <div className="aspect-video">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {exercise.videos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              参考動画がまだありません
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
