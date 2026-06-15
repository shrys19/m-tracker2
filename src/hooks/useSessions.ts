import { useCallback, useEffect, useMemo, useState } from "react";
import { db, type Session } from "../db/database";
import {
  isActiveSession,
  isCompletedSession,
  sessionDurationMs,
} from "../lib/sessions";
import { seedDemoData } from "../utils/seedData";

export type PastSessionInput = {
  start: string; // ISO string
  end: string; // ISO string
  description?: string;
  tags?: string[];
};

export type PastEventInput = {
  timestamp: string; // ISO string
  description?: string;
  tags?: string[];
};

export type SessionsState = {
  loading: boolean;
  sessions: Session[];
  activeSession: Session | null;
  totalEvents: number;
  avgDurationMs: number;

  /** Refresh from the DB. Most mutators call this internally. */
  reload: () => Promise<void>;

  // Mutators
  logQuickEvent: () => Promise<void>;
  addPastEvent: (input: PastEventInput) => Promise<void>;
  startSession: () => Promise<void>;
  endSession: () => Promise<number | null>;
  addPastSession: (input: PastSessionInput) => Promise<void>;
  updateEntry: (id: number, description: string, tags: string[]) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
  importAll: (entries: Session[]) => Promise<void>;
  seedDemo: () => Promise<void>;
};

export function useSessions(): SessionsState {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  const reload = useCallback(async () => {
    // Newest first. Dexie's reverse().sortBy("id") matches the original behavior.
    const all = await db.sessions.reverse().sortBy("id");
    setSessions(all);
    setLoading(false);
  }, []);

  // Initial load from IndexedDB on mount. The setState happens inside the
  // effect by design — we're subscribing to an external system (Dexie) on
  // mount, which is exactly what useEffect is for. The React docs list this
  // case as a legitimate use; the lint rule is a heuristic.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  // Derived state.
  const activeSession = useMemo(
    () => sessions.find(isActiveSession) ?? null,
    [sessions]
  );

  const avgDurationMs = useMemo(() => {
    const completed = sessions.filter(isCompletedSession);
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, s) => sum + sessionDurationMs(s), 0);
    return total / completed.length;
  }, [sessions]);

  // Mutators.
  const logQuickEvent = useCallback(async () => {
    await db.sessions.add({ type: "quick", timestamp: new Date().toISOString() });
    await reload();
  }, [reload]);

  const addPastEvent = useCallback(
    async ({ timestamp, description, tags }: PastEventInput) => {
      await db.sessions.add({
        type: "quick",
        timestamp,
        description: description?.trim(),
        tags,
      });
      await reload();
    },
    [reload]
  );

  const startSession = useCallback(async () => {
    if (sessions.some(isActiveSession)) return;
    await db.sessions.add({ type: "session", startTime: new Date().toISOString() });
    await reload();
  }, [reload, sessions]);

  const endSession = useCallback(async (): Promise<number | null> => {
    const active = sessions.find(isActiveSession);
    if (!active?.id) return null;
    await db.sessions.update(active.id, { endTime: new Date().toISOString() });
    await reload();
    return active.id;
  }, [reload, sessions]);

  const addPastSession = useCallback(
    async ({ start, end, description, tags }: PastSessionInput) => {
      await db.sessions.add({
        type: "session",
        startTime: start,
        endTime: end,
        description: description?.trim(),
        tags,
      });
      await reload();
    },
    [reload]
  );

  const updateEntry = useCallback(
    async (id: number, description: string, tags: string[]) => {
      await db.sessions.update(id, { description: description.trim(), tags });
      await reload();
    },
    [reload]
  );

  const deleteEntry = useCallback(
    async (id: number) => {
      await db.sessions.delete(id);
      await reload();
    },
    [reload]
  );

  const clearAll = useCallback(async () => {
    await db.sessions.clear();
    await reload();
  }, [reload]);

  const importAll = useCallback(
    async (entries: Session[]) => {
      await db.sessions.clear();
      await db.sessions.bulkAdd(entries);
      await reload();
    },
    [reload]
  );

  const seedDemo = useCallback(async () => {
    await seedDemoData();
    await reload();
  }, [reload]);

  // Stable references for the most-used derived numbers so callers can pass
  // them through component trees without forcing re-memoization downstream.
  const totalEvents = sessions.length;

  return {
    loading,
    sessions,
    activeSession,
    totalEvents,
    avgDurationMs,
    reload,
    logQuickEvent,
    addPastEvent,
    startSession,
    endSession,
    addPastSession,
    updateEntry,
    deleteEntry,
    clearAll,
    importAll,
    seedDemo,
  };
}

// Re-export Session so consumers can `import type { Session } from "../hooks/useSessions"`
// if they prefer to depend on the hook layer rather than the DB layer.
export type { Session };
