import type { Tab } from "../types";

type Props = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "calendar", label: "Calendar" },
  { id: "insights", label: "Insights" },
  { id: "settings", label: "Settings" },
];

export default function BottomNavigation({ activeTab, onChange }: Props) {
  return (
    <div className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-md justify-between px-4">
        {TABS.map(({ id, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`px-3 py-2 text-sm font-medium transition ${
                active
                  ? "border-b-2 border-blue-500 text-white"
                  : "text-zinc-500"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
