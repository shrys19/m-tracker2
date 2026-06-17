import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import type { Session } from "../db/database";

type Options = {
  sessions: Session[];
  importAll: (entries: Session[]) => Promise<void>;
};

export type ImportExportActions = {
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
};

/** Local-time YYYY-MM-DD for export filenames. */
function dateStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function useImportExport({ sessions, importAll }: Options): ImportExportActions {
  const exportData = useCallback(async () => {
    const data = JSON.stringify(sessions, null, 2);
    const fileName = `m-tracker-export-${dateStamp()}.json`;

    // Native (Android/iOS): write a file, then open the share sheet so the user
    // can save it to Files/Drive or send it — a manual backup. The browser
    // <a download> below does not work inside a WebView.
    if (Capacitor.isNativePlatform()) {
      const written = await Filesystem.writeFile({
        path: fileName,
        data,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({
        title: "M Tracker backup",
        url: written.uri,
      });
      return;
    }

    // Web: download via an anchor.
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  const importData = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const imported = JSON.parse(text) as unknown;
        if (!Array.isArray(imported)) throw new Error("Not an array");
        await importAll(imported as Session[]);
        alert("Data imported successfully.");
      } catch {
        alert("Invalid import file.");
      }
    },
    [importAll]
  );

  return { exportData, importData };
}
