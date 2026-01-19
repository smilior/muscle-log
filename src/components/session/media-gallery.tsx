"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import { addExerciseMedia, removeExerciseMedia } from "@/lib/actions/media";
import { Camera, Video, X, Plus, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Media = {
  id: string;
  url: string;
  type: string;
};

type Props = {
  sessionExerciseId: string;
  media: Media[];
};

export function MediaGallery({ sessionExerciseId, media }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = "";

    // Validate file size
    if (file.size > 50 * 1024 * 1024) {
      toast.error("ファイルサイズは50MB以下にしてください");
      return;
    }

    setIsUploading(true);
    setUploadProgress("アップロード中...");

    try {
      // Upload to API
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url, type } = await response.json();

      setUploadProgress("保存中...");

      // Save to database
      await addExerciseMedia(sessionExerciseId, url, type);

      toast.success(type === "image" ? "写真を追加しました" : "動画を追加しました");
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "アップロードに失敗しました"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (mediaId: string) => {
    setDeletingId(mediaId);
    try {
      await removeExerciseMedia(mediaId);
      toast.success("メディアを削除しました");
      router.refresh();
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Media grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map((m) => (
            <div
              key={m.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
            >
              {m.type === "image" ? (
                <Image
                  src={m.url}
                  alt=""
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => setSelectedMedia(m)}
                />
              ) : (
                <div
                  className="relative w-full h-full cursor-pointer"
                  onClick={() => setSelectedMedia(m)}
                >
                  <video
                    src={m.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="size-8 text-white" />
                  </div>
                </div>
              )}

              {/* Delete button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={deletingId === m.id}
                  >
                    {deletingId === m.id ? (
                      <Spinner size="sm" />
                    ) : (
                      <X className="size-3" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>メディアを削除</AlertDialogTitle>
                    <AlertDialogDescription>
                      この{m.type === "image" ? "写真" : "動画"}を削除しますか？
                      この操作は取り消せません。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(m.id)}>
                      削除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      {/* Upload button - temporarily hidden
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <Spinner size="sm" className="mr-1" />
              {uploadProgress}
            </>
          ) : (
            <>
              <Plus className="size-4 mr-1" />
              写真・動画を追加
            </>
          )}
        </Button>
      </div>
      */}

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="size-6" />
          </Button>

          {selectedMedia.type === "image" ? (
            <Image
              src={selectedMedia.url}
              alt=""
              width={1200}
              height={900}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={selectedMedia.url}
              controls
              autoPlay
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}
