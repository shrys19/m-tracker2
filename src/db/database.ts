import Dexie, { type Table } from "dexie";

/**
 * A single tracked entry. Two flavors are distinguished by `type`:
 *
 *  - `quick`   — instantaneous "I did it" event. Uses `timestamp`.
 *  - `session` — has a duration. Uses `startTime` and (once ended) `endTime`.
 *
 * Both kinds optionally carry a description and tags.
 */
export interface Session {
  id?: number;
  type: "quick" | "session";

  // Used when type === "quick".
  timestamp?: string;

  // Used when type === "session".
  startTime?: string;
  endTime?: string;

  description?: string;
  tags?: string[];
}

class MTrackerDatabase extends Dexie {
  sessions!: Table<Session>;

  constructor() {
    super("MTrackerDB");
    this.version(1).stores({
      sessions: "++id,type,startTime,endTime,timestamp",
    });
  }
}

export const db = new MTrackerDatabase();
