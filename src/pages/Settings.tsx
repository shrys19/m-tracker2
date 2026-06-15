import type { ReactNode } from "react";

type Props = {
  pinEnabled: boolean;
  onEnablePin: () => void;
  onDisablePin: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onSeedData: () => void;
  onReset: () => void;
};

/** Container card with consistent styling for each settings group. */
function Card({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  const border = tone === "danger" ? "border-red-900" : "border-zinc-800";
  return (
    <div className={`rounded-3xl border ${border} bg-zinc-900 p-5`}>{children}</div>
  );
}

export default function Settings({
  pinEnabled,
  onEnablePin,
  onDisablePin,
  onExport,
  onImport,
  onSeedData,
  onReset,
}: Props) {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <div className="space-y-4">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Security</h2>
          {!pinEnabled ? (
            <button
              onClick={onEnablePin}
              className="w-full rounded-xl bg-blue-600 py-4"
            >
              Enable PIN Lock
            </button>
          ) : (
            <button
              onClick={onDisablePin}
              className="w-full rounded-xl border border-red-700 py-4 text-red-400"
            >
              Disable PIN Lock
            </button>
          )}
        </Card>

        <Card>
          <button
            onClick={onExport}
            className="w-full rounded-xl bg-blue-600 py-4"
          >
            Export Data
          </button>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-semibold">Import Data</h2>
          <p className="mb-4 text-sm text-zinc-400">
            Restore activity from an exported JSON file.
          </p>
          <label className="block cursor-pointer rounded-xl bg-blue-600 py-4 text-center font-semibold">
            Select JSON File
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
              }}
            />
          </label>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-semibold">Demo Data</h2>
          <p className="mb-4 text-sm text-zinc-400">
            Populate the app with sample data.
          </p>
          <button
            onClick={onSeedData}
            className="w-full rounded-xl bg-blue-600 py-4 font-semibold"
          >
            Generate Demo Data
          </button>
        </Card>

        <Card tone="danger">
          <button
            onClick={onReset}
            className="w-full rounded-xl border border-red-700 py-4 text-red-400"
          >
            Reset All Data
          </button>
        </Card>
      </div>
    </div>
  );
}
