/**
 * Pure date/time helpers used across the app.
 *
 * Conventions:
 *  - "date key" = YYYY-MM-DD string in the user's *local* timezone. Used as a
 *    stable map key for grouping events by day.
 *  - "datetime-local value" = YYYY-MM-DDTHH:mm string in *local* time, suitable
 *    for binding to <input type="datetime-local">.
 */

/** Pad a number to 2 digits with a leading zero. */
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local-time YYYY-MM-DD key for a Date or ISO string. */
export function getLocalDateKey(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Build a YYYY-MM-DD key from (year, monthIndex, day). */
export function createDateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

/** Format a positive duration in ms as HH:MM:SS. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [pad2(hours), pad2(minutes), pad2(seconds)].join(":");
}

/** Compact duration suitable for stats cards: "5m", "2h 15m". */
export function formatDurationCompact(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`;
}

/** Human-friendly "time ago" string for activity feeds. */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / (60_000 * 60));
  const days = Math.floor(diffMs / (60_000 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

/**
 * Current local time formatted as YYYY-MM-DDTHH:mm for <input type="datetime-local">.
 *
 * Important: do NOT use `new Date().toISOString().slice(0, 16)` — that returns UTC,
 * which displays incorrectly in the input for users outside UTC.
 */
export function datetimeLocalNow(): string {
  const d = new Date();
  return (
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` +
    `T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  );
}
