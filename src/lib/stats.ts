import type { Session } from "../db/database";
import { getLocalDateKey } from "./date";
import {
  getSessionDate,
  isCompletedSession,
  sessionDurationMs,
} from "./sessions";

const DAY_MS = 1000 * 60 * 60 * 24;

export type StreakStats = {
  currentStreak: number;
  bestStreak: number;
  bestStreakDates: string[];
  daysSinceLastEvent: number;
};

/**
 * Streak computation. A "day" is a local-time YYYY-MM-DD key with at least one
 * entry. The current streak counts back from today; the best streak is the
 * longest consecutive run in history.
 *
 * When `tag` is given, only entries carrying that tag count toward the streak.
 */
export function calculateStreakStats(
  sessions: Session[],
  tag?: string
): StreakStats {
  if (tag) {
    sessions = sessions.filter((s) => s.tags?.includes(tag));
  }

  if (sessions.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      bestStreakDates: [],
      daysSinceLastEvent: 0,
    };
  }

  // Unique days with activity, ascending.
  const uniqueDays = Array.from(
    new Set(
      sessions
        .map(getSessionDate)
        .filter((d): d is string => Boolean(d))
        .map((d) => getLocalDateKey(d))
    )
  ).sort();

  const dayTimestamps = uniqueDays.map((day) => new Date(day).getTime());

  let bestStreak = 1;
  let bestStreakDates: string[] = [uniqueDays[0]];

  let runStart = uniqueDays[0];
  let currentRun = 1;

  for (let i = 1; i < dayTimestamps.length; i++) {
    const diffDays = (dayTimestamps[i] - dayTimestamps[i - 1]) / DAY_MS;

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > bestStreak) {
        bestStreak = currentRun;
        const startIndex = uniqueDays.indexOf(runStart);
        bestStreakDates = uniqueDays.slice(startIndex, i + 1);
      }
    } else {
      currentRun = 1;
      runStart = uniqueDays[i];
    }
  }

  // Current streak: walk backwards from today, counting consecutive days present.
  const daySet = new Set(uniqueDays);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  while (daySet.has(getLocalDateKey(cursor))) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Days since the most recent event.
  const latestTs = Math.max(
    ...sessions
      .map(getSessionDate)
      .filter((d): d is string => Boolean(d))
      .map((d) => new Date(d).getTime())
  );
  const daysSinceLastEvent = Math.floor((Date.now() - latestTs) / DAY_MS);

  return { currentStreak, bestStreak, bestStreakDates, daysSinceLastEvent };
}

export type InsightsStats = {
  totalEvents: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  longestSessionMs: number;
  avgSessionMs: number;
  totalSessionMs: number;
  daysSinceLastActivity: number;
  mostActiveDay: string | null; // "Sunday" .. "Saturday"
  mostActiveHour: number | null; // 0..23
};

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function calculateInsights(sessions: Session[]): InsightsStats {
  const now = Date.now();
  const weekAgo = now - 7 * DAY_MS;
  const monthAgo = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.getTime();
  })();

  let eventsThisWeek = 0;
  let eventsThisMonth = 0;
  let longestSessionMs = 0;
  let totalSessionMs = 0;
  let completedCount = 0;
  let latestTs = -Infinity;

  const weekdayCounts = new Array<number>(7).fill(0);
  const hourCounts = new Array<number>(24).fill(0);

  for (const s of sessions) {
    const dateString = getSessionDate(s);
    if (!dateString) continue;

    const ts = new Date(dateString).getTime();
    if (ts >= weekAgo) eventsThisWeek++;
    if (ts >= monthAgo) eventsThisMonth++;
    if (ts > latestTs) latestTs = ts;

    const d = new Date(ts);
    weekdayCounts[d.getDay()]++;
    hourCounts[d.getHours()]++;

    if (isCompletedSession(s)) {
      const dur = sessionDurationMs(s);
      totalSessionMs += dur;
      completedCount++;
      if (dur > longestSessionMs) longestSessionMs = dur;
    }
  }

  const avgSessionMs = completedCount > 0 ? totalSessionMs / completedCount : 0;
  const daysSinceLastActivity =
    latestTs === -Infinity ? 0 : Math.floor((now - latestTs) / DAY_MS);

  const mostActiveDay =
    sessions.length === 0
      ? null
      : WEEKDAY_NAMES[weekdayCounts.indexOf(Math.max(...weekdayCounts))];

  const mostActiveHour =
    sessions.length === 0 ? null : hourCounts.indexOf(Math.max(...hourCounts));

  return {
    totalEvents: sessions.length,
    eventsThisWeek,
    eventsThisMonth,
    longestSessionMs,
    avgSessionMs,
    totalSessionMs,
    daysSinceLastActivity,
    mostActiveDay,
    mostActiveHour,
  };
}
