import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function Spinner({ className, size = "md" }: Props) {
  return (
    <Loader2
      className={cn("animate-spin", sizeClasses[size], className)}
    />
  );
}
