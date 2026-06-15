export type AppSettings = {
  pinEnabled: boolean;
  pinHash: string;
};

const SETTINGS_KEY = "m-tracker-settings";

const DEFAULT_SETTINGS: AppSettings = {
  pinEnabled: false,
  pinHash: "",
};

export function getSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return JSON.parse(raw) as AppSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
