import { useMemo, type ReactNode } from "react";
import type { Session } from "../db/database";
import {
  calculateInsights,
  calculateFinishStats,
  monthlyFinishSeries,
  type MonthlyPoint,
} from "../lib/stats";
import { formatDurationCompact } from "../lib/date";

type Props = {
  sessions: Session[];
};

function StatCard({
  label,
  value,
  large,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  /** Larger value text for "headline" stats. */
  large?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className={large ? "text-sm text-zinc-400" : "text-xs text-zinc-400"}>{label}</p>
      <div
        className={`mt-2 font-bold ${large ? "text-3xl" : "text-2xl"} ${
          valueClassName ?? ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/** All-CSS vertical bar chart of monthly finish rate. No charting dependency. */
function FinishRateChart({ series }: { series: MonthlyPoint[] }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="mb-4 text-sm text-zinc-400">Finish Rate Trend</p>
      <div className="flex items-end justify-between gap-2">
        {series.map((p) => (
          <div
            key={`${p.year}-${p.monthIndex}`}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="text-xs text-zinc-400">
              {p.rate == null ? "" : `${Math.round(p.rate * 100)}%`}
            </div>
            <div className="flex h-32 w-full items-end rounded-lg bg-zinc-800">
              <div
                className="w-full rounded-lg bg-green-500 transition-[height]"
                style={{ height: `${(p.rate ?? 0) * 100}%` }}
              />
            </div>
            <div className="text-xs text-zinc-500">{p.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Insights({ sessions }: Props) {
  const stats = useMemo(() => calculateInsights(sessions), [sessions]);
  const finish = useMemo(() => calculateFinishStats(sessions), [sessions]);
  const series = useMemo(() => monthlyFinishSeries(sessions), [sessions]);

  const showDuration = (ms: number) =>
    ms > 0 ? formatDurationCompact(ms) : "--";

  const pct = (rate: number | null) =>
    rate == null ? "--" : `${Math.round(rate * 100)}%`;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Insights</h1>

      <div className="grid gap-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Finish Rate</p>
          <div className="mt-2 text-4xl font-bold text-green-400">
            {pct(finish.rate)}
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            This month {pct(finish.thisMonthRate)}
            {finish.monthDelta != null && finish.monthDelta !== 0 && (
              <span
                className={`ml-2 font-medium ${
                  finish.monthDelta > 0 ? "text-green-400" : "text-orange-400"
                }`}
              >
                {finish.monthDelta > 0 ? "▲" : "▼"}{" "}
                {Math.abs(Math.round(finish.monthDelta * 100))}%
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Finished"
            value={finish.finished}
            valueClassName="text-green-400"
          />
          <StatCard
            label="Not Finished"
            value={finish.notFinished}
            valueClassName="text-orange-400"
          />
        </div>

        <FinishRateChart series={series} />

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
