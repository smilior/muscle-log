"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPreset } from "@/lib/actions/presets";
import { Plus, ChevronRight, ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";

type PresetExercise = {
  id: string;
  exercise: {
    id: string;
    name: string;
  };
};

type Preset = {
  id: string;
  name: string;
  exercises: PresetExercise[];
};

type Props = {
  initialPresets: Preset[];
};

export function PresetList({ initialPresets }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const presets = initialPresets;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const newPreset = await createPreset({ name: name.trim() });
      setName("");
      setOpen(false);
      router.push(`/presets/${newPreset.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 size-4" />
            プリセットを追加
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プリセットを追加</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="胸の日"
              required
            />
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "作成中..." : "作成"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {presets.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {presets.map((preset) => (
                <Link
                  key={preset.id}
                  href={`/presets/${preset.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ListChecks className="size-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {preset.exercises.length > 0
                          ? preset.exercises.map((pe) => pe.exercise.name).join("、")
                          : "種目なし"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            プリセットがまだありません。上のボタンから追加してください。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
