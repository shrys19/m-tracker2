import type { Session } from "../db/database";

/**
 * The canonical "when did this happen" timestamp for a session, regardless of type.
 * Returns undefined for malformed entries.
 */
export function getSessionDate(session: Session): string | undefined {
  return session.type === "quick" ? session.timestamp : session.startTime;
}

/** True if this is a session that has both a start and an end. */
export function isCompletedSession(session: Session): boolean {
  return (
    session.type === "session" &&
    typeof session.startTime === "string" &&
    typeof session.endTime === "string"
  );
}

/** True if this is a session that has started but not yet ended. */
export function isActiveSession(session: Session): boolean {
  return (
    session.type === "session" &&
    typeof session.startTime === "string" &&
    !session.endTime
  );
}

/** Duration of a completed session in ms. Returns 0 if not completed. */
export function sessionDurationMs(session: Session): number {
  if (!isCompletedSession(session)) return 0;
  return new Date(session.endTime!).getTime() - new Date(session.startTime!).getTime();
}
