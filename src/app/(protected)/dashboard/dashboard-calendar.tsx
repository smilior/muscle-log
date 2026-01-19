"use client";

import { useState, useTransition } from "react";
import { Calendar } from "@/components/calendar/calendar";
import { getSessionsForMonth } from "@/lib/actions/sessions";

type Session = {
  id: string;
  date: string;
  isRestDay: boolean;
  preset: { id: string; name: string } | null;
  exercises: { id: string }[];
};

type Props = {
  initialSessions: Session[];
  initialYear: number;
  initialMonth: number;
};

export function DashboardCalendar({
  initialSessions,
  initialYear,
  initialMonth,
}: Props) {
  const [sessions, setSessions] = useState(initialSessions);
  const [isPending, startTransition] = useTransition();

  const handleMonthChange = (year: number, month: number) => {
    startTransition(async () => {
      const newSessions = await getSessionsForMonth(year, month);
      setSessions(newSessions);
    });
  };

  return (
    <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
      <Calendar
        sessions={sessions}
        initialYear={initialYear}
        initialMonth={initialMonth}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}
