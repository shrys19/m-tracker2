/**
 * Status tags. Every event/session MUST carry exactly one of these — it drives
 * the Finished / Not Finished streaks. Mutually exclusive; chosen via StatusPicker.
 */
export const STATUS_TAGS = ["Finished", "Not Finished"] as const;
export type StatusTag = (typeof STATUS_TAGS)[number];

/**
 * Optional descriptive tags users may add on top of the required status.
 * Keeping this small and curated avoids spelling drift and makes the
 * insight aggregations meaningful.
 */
export const AVAILABLE_TAGS = [
  "Help",
  "No Help",
  "Toys",
  "Very good",
  "Good",
  "Okay",
  "Bad",
] as const;

export type Tag = (typeof AVAILABLE_TAGS)[number];

const STATUS_SET = new Set<string>(STATUS_TAGS);

/** The status tag carried by an entry, or null if none set. */
export function getStatus(tags?: string[]): StatusTag | null {
  return (tags?.find((t) => STATUS_SET.has(t)) as StatusTag | undefined) ?? null;
}

/** The non-status tags carried by an entry. */
export function getOtherTags(tags?: string[]): string[] {
  return (tags ?? []).filter((t) => !STATUS_SET.has(t));
}

/** Combine a chosen status with other tags into a single tags array. */
export function withStatus(status: string, otherTags: string[]): string[] {
  return [status, ...otherTags.filter((t) => !STATUS_SET.has(t))];
}
