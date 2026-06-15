import { useCallback, useState } from "react";
import { hashPin } from "../utils/security";
import {
  getSettings,
  saveSettings,
  type AppSettings,
} from "../utils/settings";

export type SettingsState = {
  settings: AppSettings;
  unlocked: boolean;
  unlock: () => void;
  enablePin: (pin: string) => Promise<void>;
  disablePin: () => void;
};

export function useSettings(): SettingsState {
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  // If no PIN is set, the user is considered "unlocked" from the start.
  const [unlocked, setUnlocked] = useState<boolean>(() => !getSettings().pinEnabled);

  const unlock = useCallback(() => setUnlocked(true), []);

  const enablePin = useCallback(async (pin: string) => {
    const pinHash = await hashPin(pin);
    const next: AppSettings = { pinEnabled: true, pinHash };
    saveSettings(next);
    setSettings(next);
    setUnlocked(true);
  }, []);

  const disablePin = useCallback(() => {
    const next: AppSettings = { pinEnabled: false, pinHash: "" };
    saveSettings(next);
    setSettings(next);
  }, []);

  return { settings, unlocked, unlock, enablePin, disablePin };
}
