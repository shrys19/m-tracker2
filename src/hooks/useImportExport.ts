import { useCallback } from "react";
import type { Session } from "../db/database";

type Options = {
  sessions: Session[];
  importAll: (entries: Session[]) => Promise<void>;
};

export type ImportExportActions = {
  exportData: () => void;
  importData: (file: File) => Promise<void>;
};

export function useImportExport({ sessions, importAll }: Options): ImportExportActions {
  const exportData = useCallback(() => {
    const data = JSON.stringify(sessions, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "m-tracker-export.json";
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
