type Props = {
  tags: string[];
};

/** Read-only display of tags as small blue pills. Renders nothing if empty. */
export default function TagBadges({ tags }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-blue-950 px-3 py-1 text-xs text-blue-300"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
