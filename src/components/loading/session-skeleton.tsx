import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SessionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-md bg-muted" />
        <div className="flex-1">
          <div className="h-7 w-32 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded mt-1" />
        </div>
      </div>

      {/* Preset button */}
      <div className="h-10 w-full bg-muted rounded-md" />

      {/* Exercise cards */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-4 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
              </div>
              <div className="size-8 bg-muted rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 px-2">
                <div className="w-6" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="w-8" />
              </div>
              {/* Set rows */}
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center"
                >
                  <div className="w-6 h-4 bg-muted rounded" />
                  <div className="h-9 bg-muted rounded" />
                  <div className="h-9 bg-muted rounded" />
                  <div className="h-9 bg-muted rounded" />
                  <div className="size-8 bg-muted rounded" />
                </div>
              ))}
              <div className="h-8 w-full bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add button */}
      <div className="h-10 w-full bg-muted rounded-md" />
    </div>
  );
}
