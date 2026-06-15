/**
 * The fixed set of tags users can apply to events and sessions.
 * Keeping this small and curated avoids spelling drift and makes the
 * insight aggregations meaningful.
 */
export const AVAILABLE_TAGS = [
  "P",
  "No P",
  "Very good",
  "Good",
  "Okay",
  "Bad",
] as const;

export type Tag = (typeof AVAILABLE_TAGS)[number];
