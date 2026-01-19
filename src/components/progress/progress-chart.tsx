"use client";

import { useMemo } from "react";
import type { ExerciseHistoryEntry } from "@/lib/actions/progress";

type Props = {
  history: ExerciseHistoryEntry[];
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function ProgressChart({ history }: Props) {
  const chartData = useMemo(() => {
    // Get max values for scaling
    const weights = history.map((h) => h.maxWeight ?? 0).filter((w) => w > 0);
    const oneRMs = history.map((h) => h.estimatedOneRM ?? 0).filter((r) => r > 0);

    const maxWeight = Math.max(...weights, 0);
    const maxOneRM = Math.max(...oneRMs, 0);
    const maxValue = Math.max(maxWeight, maxOneRM);

    // Round up to nice number for Y axis
    const yMax = Math.ceil(maxValue / 10) * 10 + 10;

    return {
      entries: history,
      yMax,
      yStep: Math.ceil(yMax / 4),
    };
  }, [history]);

  const { entries, yMax, yStep } = chartData;

  if (entries.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        グラフを表示するには2回以上の記録が必要です
      </div>
    );
  }

  // SVG dimensions
  const width = 100;
  const height = 50;
  const padding = { top: 5, right: 5, bottom: 10, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points
  const weightPoints = entries
    .map((entry, i) => {
      if (entry.maxWeight === null) return null;
      const x = padding.left + (i / (entries.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (entry.maxWeight / yMax) * chartHeight;
      return { x, y, value: entry.maxWeight, date: entry.date };
    })
    .filter(Boolean) as { x: number; y: number; value: number; date: string }[];

  const oneRMPoints = entries
    .map((entry, i) => {
      if (entry.estimatedOneRM === null) return null;
      const x = padding.left + (i / (entries.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (entry.estimatedOneRM / yMax) * chartHeight;
      return { x, y, value: entry.estimatedOneRM, date: entry.date };
    })
    .filter(Boolean) as { x: number; y: number; value: number; date: string }[];

  // Create path strings
  const weightPath =
    weightPoints.length > 1
      ? `M ${weightPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`
      : "";

  const oneRMPath =
    oneRMPoints.length > 1
      ? `M ${oneRMPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`
      : "";

  // Y axis labels
  const yLabels = Array.from({ length: 5 }, (_, i) => yMax - i * yStep);

  // X axis labels (show first, middle, last)
  const xLabelIndices = [0, Math.floor(entries.length / 2), entries.length - 1];

  return (
    <div className="space-y-2">
      <div className="relative aspect-[2/1]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {yLabels.map((label, i) => {
            const y = padding.top + (i / 4) * chartHeight;
            return (
              <g key={label}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeWidth={0.2}
                />
                <text
                  x={padding.left - 1}
                  y={y + 1}
                  fontSize="3"
                  fill="currentColor"
                  fillOpacity={0.5}
                  textAnchor="end"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Weight line */}
          {weightPath && (
            <path
              d={weightPath}
              fill="none"
              stroke="#22c55e"
              strokeWidth={0.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 1RM line */}
          {oneRMPath && (
            <path
              d={oneRMPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={0.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1.5 1"
            />
          )}

          {/* Weight points */}
          {weightPoints.map((point, i) => (
            <circle
              key={`weight-${i}`}
              cx={point.x}
              cy={point.y}
              r={1}
              fill="#22c55e"
            />
          ))}

          {/* 1RM points */}
          {oneRMPoints.map((point, i) => (
            <circle
              key={`1rm-${i}`}
              cx={point.x}
              cy={point.y}
              r={1}
              fill="#3b82f6"
            />
          ))}

          {/* X axis labels */}
          {xLabelIndices.map((index) => {
            const entry = entries[index];
            if (!entry) return null;
            const x = padding.left + (index / (entries.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={height - 2}
                fontSize="2.5"
                fill="currentColor"
                fillOpacity={0.5}
                textAnchor="middle"
              >
                {formatDate(entry.date)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-green-500 rounded" />
          <span>最大重量</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-blue-500 rounded border-dashed" />
          <span>推定1RM</span>
        </div>
      </div>
    </div>
  );
}
