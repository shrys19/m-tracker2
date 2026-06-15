import { AVAILABLE_TAGS } from "../../constants/tags";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  /** Set "sm" inside the inline edit row on the timeline to match original sizing. */
  size?: "default" | "sm";
};

/**
 * The "select 0-N tags" chip group used by every modal that captures notes.
 * Renders all AVAILABLE_TAGS and toggles them in/out of `value`.
 */
export default function TagPicker({ value, onChange, size = "default" }: Props) {
  function toggle(tag: string) {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  }

  const sizeClass = size === "sm" ? "px-3 py-2 text-xs" : "px-3 py-2 text-sm";

  return (
    <div className="flex flex-wrap gap-2">
      {AVAILABLE_TAGS.map((tag) => {
        const selected = value.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`rounded-full ${sizeClass} ${
              selected ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
