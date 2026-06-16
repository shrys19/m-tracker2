import type { Session } from "../db/database";
import { getStatus } from "../constants/tags";
import { getLocalDateKey } from "./date";
import { getSessionDate } from "./sessions";

const DAY_MS = 1000 * 60 * 60 * 24;

export type ActivityFilters = {
  status: "all" | "Finished" | "Not Finished";
  type: "all" | "quick" | "session";
  tag: string; // "all" or one of AVAILABLE_TAGS
  range: "all" | "today" | "week" | "month";
  sort: "newest" | "oldest";
};

export const DEFAULT_FILTERS: ActivityFilters = {
  status: "all",
  type: "all",
  tag: "all",
  range: "all",
  sort: "newest",
};

/** Apply the Dashboard activity filters, then sort by date. Pure. */
export function filterSortActivity(
  sessions: Session[],
  f: ActivityFilters
): Session[] {
  const now = new Date();
  const todayKey = getLocalDateKey(now);
  const weekAgo = now.getTime() - 7 * DAY_MS;
  const curY = now.getFullYear();
  const curM = now.getMonth();

  const filtered = sessions.filter((s) => {
    if (f.status !== "all" && getStatus(s.tags) !== f.status) return false;
    if (f.type !== "all" && s.type !== f.type) return false;
    if (f.tag !== "all" && !s.tags?.includes(f.tag)) return false;

    if (f.range !== "all") {
      const date = getSessionDate(s);
      if (!date) return false;
      const d = new Date(date);
      if (f.range === "today" && getLocalDateKey(d) !== todayKey) return false;
      if (f.range === "week" && d.getTime() < weekAgo) return false;
      if (
        f.range === "month" &&
        (d.getFullYear() !== curY || d.getMonth() !== curM)
      ) {
        return false;
      }
    }
    return true;
  });

  const ts = (s: Session) => {
    const date = getSessionDate(s);
    return date ? new Date(date).getTime() : 0;
  };
  return filtered.sort((a, b) =>
    f.sort === "newest" ? ts(b) - ts(a) : ts(a) - ts(b)
  );
}
