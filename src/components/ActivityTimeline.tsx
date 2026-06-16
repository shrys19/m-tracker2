import { useMemo, useState } from "react";
import type { Session } from "../db/database";
import { AVAILABLE_TAGS, STATUS_TAGS } from "../constants/tags";
import {
  DEFAULT_FILTERS,
  filterSortActivity,
  type ActivityFilters,
} from "../lib/activity";
import ActivityTimelineItem from "./ActivityTimelineItem";

type Props = {
  sessions: Session[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, description: string, tags: string[]) => Promise<void>;
};

const PAGE = 20;

const selectClass =
  "rounded-xl bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none";

/**
 * Sessions + quick events with filter/sort controls, capped to PAGE entries
 * with a "Show more" toggle so the feed stays manageable.
 */
export default function ActivityTimeline({ sessions, onDelete, onUpdate }: Props) {
  const [filters, setFilters] = useState<ActivityFilters>(DEFAULT_FILTERS);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () => filterSortActivity(sessions, filters),
    [sessions, filters]
  );

  const visible = showAll ? filtered : filtered.slice(0, PAGE);
  const remaining = filtered.length - PAGE;

  function set<K extends keyof ActivityFilters>(key: K, value: ActivityFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setShowAll(false);
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-xl font-semibold">Activity</h2>

      <div className="mb-6 flex flex-wrap gap-2">
        <select
          aria-label="Filter by status"
          className={selectClass}
          value={filters.status}
          onChange={(e) => set("status", e.target.value as ActivityFilters["status"])}
        >
          <option value="all">All status</option>
          {STATUS_TAGS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by type"
          className={selectClass}
          value={filters.type}
          onChange={(e) => set("type", e.target.value as ActivityFilters["type"])}
        >
          <option value="all">All types</option>
          <option value="quick">Events</option>
          <option value="session">Sessions</option>
        </select>

        <select
          aria-label="Filter by tag"
          className={selectClass}
          value={filters.tag}
          onChange={(e) => set("tag", e.target.value)}
        >
          <option value="all">All tags</option>
          {AVAILABLE_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by date range"
          className={selectClass}
          value={filters.range}
          onChange={(e) => set("range", e.target.value as ActivityFilters["range"])}
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>

        <select
          aria-label="Sort order"
          className={selectClass}
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value as ActivityFilters["sort"])}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-500">
          {sessions.length === 0 ? "No activity yet." : "No matching activity."}
        </p>
      ) : (
        <>
          <div className="space-y-5">
            {visible.map((item) => (
              <ActivityTimelineItem
                key={item.id}
                item={item}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>

          {filtered.length > PAGE && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-6 w-full rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300"
            >
              {showAll ? "Show less" : `Show more (${remaining} more)`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
