import { useMemo, type ReactNode } from "react";
import type { Session } from "../db/database";
import { calculateStreakStats } from "../lib/stats";
import { formatDuration } from "../lib/date";
import ActiveSessionCard from "../components/ActiveSessionCard";
import ActivityTimeline from "../components/ActivityTimeline";

type Props = {
  sessions: Session[];
  activeSession: Session | null;
  totalEvents: number;
  avgDurationMs: number;
  onDeleteEntry: (id: number) => void;
  onEndSession: () => void;
  onUpdateEntry: (id: number, description: string, tags: string[]) => Promise<void>;
  onShowBestStreak: (dates: string[]) => void;
};

function StatTile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${valueClassName ?? ""}`}>{value}</div>
    </div>
  );
}

export default function Dashboard({
  sessions,
  activeSession,
  totalEvents,
  avgDurationMs,
  onDeleteEntry,
  onEndSession,
  onUpdateEntry,
  onShowBestStreak,
}: Props) {
  const finishedStats = useMemo(
    () => calculateStreakStats(sessions, "Finished"),
    [sessions]
  );
  const notFinishedStats = useMemo(
    () => calculateStreakStats(sessions, "Not Finished"),
    [sessions]
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-4xl font-bold">M Tracker</h1>
        <p className="mt-2 text-zinc-400">Private tracking on this device</p>
      </div>

      <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <StatTile label="Total Events" value={totalEvents} />

          <StatTile label="Days Since Last" value={finishedStats.daysSinceLastEvent} />

          <StatTile
            label="Finished Streak"
            value={finishedStats.currentStreak}
            valueClassName="text-green-400"
          />

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="text-xs text-zinc-500">Best Finished</div>
            <button
              onClick={() => onShowBestStreak(finishedStats.bestStreakDates)}
              className="mt-2 text-3xl font-bold text-yellow-400"
            >
              🔥 {finishedStats.bestStreak}
            </button>
          </div>

          <StatTile
            label="Not Finished Streak"
            value={notFinishedStats.currentStreak}
            valueClassName="text-orange-400"
          />

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="text-xs text-zinc-500">Best Not Finished</div>
            <button
              onClick={() => onShowBestStreak(notFinishedStats.bestStreakDates)}
              className="mt-2 text-3xl font-bold text-yellow-400"
            >
              🔥 {notFinishedStats.bestStreak}
            </button>
          </div>

          <div className="col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Avg Session</span>
              <span className="font-medium">
                {avgDurationMs ? formatDuration(avgDurationMs) : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {activeSession?.startTime && (
        <ActiveSessionCard
          startTime={activeSession.startTime}
          onEnd={onEndSession}
        />
      )}

      <ActivityTimeline
        sessions={sessions}
        onDelete={onDeleteEntry}
        onUpdate={onUpdateEntry}
      />
    </>
  );
}
