import { useMemo, type ReactNode } from "react";
import type { Session } from "../db/database";
import { calculateInsights } from "../lib/stats";
import { formatDurationCompact } from "../lib/date";

type Props = {
  sessions: Session[];
};

function StatCard({
  label,
  value,
  large,
}: {
  label: string;
  value: ReactNode;
  /** Larger value text for "headline" stats. */
  large?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className={large ? "text-sm text-zinc-400" : "text-xs text-zinc-400"}>{label}</p>
      <div
        className={`mt-2 font-bold ${large ? "text-3xl" : "text-2xl"}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function Insights({ sessions }: Props) {
  const stats = useMemo(() => calculateInsights(sessions), [sessions]);

  const showDuration = (ms: number) =>
    ms > 0 ? formatDurationCompact(ms) : "--";

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Insights</h1>

      <div className="grid gap-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Total Events</p>
          <div className="mt-2 text-4xl font-bold">{stats.totalEvents}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="This Week" value={stats.eventsThisWeek} />
          <StatCard label="This Month" value={stats.eventsThisMonth} />
        </div>

        <StatCard label="Longest Session" value={showDuration(stats.longestSessionMs)} large />
        <StatCard label="Average Session" value={showDuration(stats.avgSessionMs)} large />
        <StatCard label="Total Session Time" value={showDuration(stats.totalSessionMs)} large />
        <StatCard label="Days Since Last Activity" value={stats.daysSinceLastActivity} large />
        <StatCard label="Most Active Day" value={stats.mostActiveDay ?? "--"} />
        <StatCard
          label="Most Active Hour"
          value={stats.mostActiveHour == null ? "--" : `${stats.mostActiveHour}:00`}
        />
      </div>
    </div>
  );
}
