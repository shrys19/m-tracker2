import { db, type Session } from "../db/database";
import { STATUS_TAGS } from "../constants/tags";

/** Random required status tag — every demo entry carries one. */
function randomStatus(): string {
  return STATUS_TAGS[Math.floor(Math.random() * STATUS_TAGS.length)];
}

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * Wipes the sessions table and repopulates it with ~45 random entries spread
 * over the last 60 days. Useful for screenshots, demos, and exercising the
 * streak/stat code without manual data entry.
 */
export async function seedDemoData(): Promise<void> {
  await db.sessions.clear();

  const now = new Date();
  const entries: Session[] = [];

  function daysAgo(days: number): Date {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  }

  for (let i = 0; i < 45; i++) {
    const date = daysAgo(Math.floor(Math.random() * 60));

    // 0-2 quick events that day, spaced an hour apart.
    const quickCount = Math.floor(Math.random() * 3);
    for (let j = 0; j < quickCount; j++) {
      entries.push({
        type: "quick",
        timestamp: new Date(date.getTime() + j * HOUR_MS).toISOString(),
        tags: [randomStatus()],
      });
    }

    // 60% chance of a session that day, 5-30 minutes long, starting in the
    // first 12 hours.
    if (Math.random() > 0.4) {
      const start = new Date(date.getTime() + Math.random() * 12 * HOUR_MS);
      const durationMs = 5 * MINUTE_MS + Math.random() * 25 * MINUTE_MS;
      entries.push({
        type: "session",
        startTime: start.toISOString(),
        endTime: new Date(start.getTime() + durationMs).toISOString(),
        tags: [randomStatus()],
      });
    }
  }

  await db.sessions.bulkAdd(entries);
}
