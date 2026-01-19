"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    name: "ホーム",
    href: "/dashboard",
    icon: Home,
    matchPaths: ["/dashboard", "/session"],
  },
  {
    name: "分析",
    href: "/progress",
    icon: BarChart3,
    matchPaths: ["/progress"],
  },
  {
    name: "設定",
    href: "/settings",
    icon: Settings,
    matchPaths: ["/settings", "/exercises", "/presets"],
  },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-pb">
      <div className="mx-auto max-w-lg">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const isActive = tab.matchPaths.some((path) =>
              pathname.startsWith(path)
            );

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className={cn("size-5", isActive && "stroke-[2.5]")} />
                <span className={cn(isActive && "font-medium")}>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
