export function CalendarSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="size-10 bg-muted rounded-md" />
        <div className="h-6 w-24 bg-muted rounded" />
        <div className="size-10 bg-muted rounded-md" />
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="py-2">
            <div className="h-4 w-6 mx-auto bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
