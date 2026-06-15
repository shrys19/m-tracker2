import { useMemo, useState } from "react";
import type { Session } from "../db/database";
import { createDateKey, getLocalDateKey } from "../lib/date";
import { getSessionDate } from "../lib/sessions";

type Props = {
  sessions: Session[];
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Color class for a day cell based on how many events occurred that day. */
function intensityClassForCount(count: number): string {
  if (count >= 4) return "bg-blue-500";
  if (count >= 2) return "bg-blue-700";
  if (count === 1) return "bg-blue-900";
  return "bg-zinc-800";
}

export default function Calendar({ sessions }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    () => getLocalDateKey(new Date())
  );

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const today = new Date();

  // Map of YYYY-MM-DD → number of events that day.
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const session of sessions) {
      const date = getSessionDate(session);
      if (!date) continue;
      const day = getLocalDateKey(date);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    return map;
  }, [sessions]);

  // Sessions that fall on the selected date.
  const selectedActivities = useMemo(() => {
    if (!selectedDate) return [];
    return sessions.filter((session) => {
      const date = getSessionDate(session);
      if (!date) return false;
      return getLocalDateKey(date) === selectedDate;
    });
  }, [sessions, selectedDate]);

  // Build the grid of cells: leading blanks for the first weekday + each day number.
  const calendarCells: Array<number | null> = useMemo(() => {
    const cells: Array<number | null> = [];
    const startWeekday = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(day);
    return cells;
  }, [year, monthIndex]);

  function previousMonth() {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={previousMonth}
          className="rounded-xl bg-zinc-900 px-4 py-2"
          aria-label="Previous month"
        >
          ←
        </button>

        <h1 className="text-2xl font-bold">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h1>

        <button
          onClick={nextMonth}
          className="rounded-xl bg-zinc-900 px-4 py-2"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-3 grid grid-cols-7 text-center text-sm text-zinc-500">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((day, index) => {
            if (!day) {
              return <div key={`blank-${index}`} className="aspect-square" />;
            }

            const dateKey = createDateKey(year, monthIndex, day);
            const count = activityMap.get(dateKey) ?? 0;
            const selected = selectedDate === dateKey;
            const isToday =
              day === today.getDate() &&
              monthIndex === today.getMonth() &&
              year === today.getFullYear();

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateKey)}
                className={`relative flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition ${
                  selected ? "bg-white text-black" : intensityClassForCount(count)
                } ${
                  isToday
                    ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-900"
                    : ""
                }`}
              >
                {day}
                {count > 1 && (
                  <div className="absolute bottom-1 right-1 rounded-full bg-black/40 px-1 text-[10px] text-white">
                    {count}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-zinc-500">
          <LegendDot className="border border-white" label="Today" />
          <LegendDot className="bg-blue-900" label="1 Event" />
          <LegendDot className="bg-blue-700" label="2+ Events" />
          <LegendDot className="bg-blue-500" label="4+ Events" />
        </div>
      </div>

      {selectedDate && (
        <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {new Date(selectedDate).toLocaleDateString()}
          </h2>

          {selectedActivities.length === 0 ? (
            <p className="text-zinc-500">No activity</p>
          ) : (
            <div className="space-y-3">
              {selectedActivities.map((activity) => (
                <DayActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded ${className}`} />
      {label}
    </div>
  );
}

function DayActivityRow({ activity }: { activity: Session }) {
  if (activity.type === "quick") {
    return (
      <div className="rounded-xl bg-zinc-800 p-4">
        <div className="font-medium">I did it</div>
        <div className="text-sm text-zinc-400">
          {new Date(activity.timestamp!).toLocaleTimeString()}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-zinc-800 p-4">
      <div className="font-medium">Session</div>
      <div className="text-sm text-zinc-400">
        Started {new Date(activity.startTime!).toLocaleTimeString()}
      </div>
      {activity.endTime && (
        <div className="text-sm text-zinc-400">
          Ended {new Date(activity.endTime).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
