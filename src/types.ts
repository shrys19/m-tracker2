export const TAB_ORDER = [
  "dashboard",
  "calendar",
  "insights",
  "settings",
] as const;

export type Tab = (typeof TAB_ORDER)[number];
