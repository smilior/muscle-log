import { Card, CardContent } from "@/components/ui/card";
import { getSessionsForMonth } from "@/lib/actions/sessions";
import { DashboardCalendar } from "./dashboard-calendar";

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const sessions = await getSessionsForMonth(year, month);

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Muscle Log</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DashboardCalendar
            initialSessions={sessions}
            initialYear={year}
            initialMonth={month}
          />
        </CardContent>
      </Card>
    </div>
  );
}
