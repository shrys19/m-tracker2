import { STATUS_TAGS } from "../../constants/tags";

type Props = {
  value: string | null;
  onChange: (next: string) => void;
  /** Set "sm" inside the inline edit row on the timeline to match sizing. */
  size?: "default" | "sm";
};

/**
 * Required, mutually-exclusive status selector ("Finished" / "Not Finished").
 * Every event must carry one — this is the source of the two streaks.
 */
export default function StatusPicker({ value, onChange, size = "default" }: Props) {
  const sizeClass = size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_TAGS.map((tag) => {
        const selected = value === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(tag)}
            className={`rounded-full font-medium ${sizeClass} ${
              selected ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
