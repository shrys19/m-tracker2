import { TAB_ORDER, type Tab } from "../types";

type Props = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

const TAB_LABELS: Record<Tab, string> = {
  dashboard: "Dashboard",
  calendar: "Calendar",
  insights: "Insights",
  settings: "Settings",
};

export default function BottomNavigation({ activeTab, onChange }: Props) {
  return (
    <div className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-md justify-between px-4">
        {TAB_ORDER.map((id) => {
          const label = TAB_LABELS[id];
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
