import { forwardRef } from "preact/compat";

const HighlightedText = ({ text, matches }) => {
  if (!matches || matches.length === 0) return <span>{text}</span>;

  const parts = [];
  let lastIndex = 0;

  matches.forEach((index, i) => {
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    parts.push(
      <span key={i} class="font-bold text-match">
        {text[index]}
      </span>,
    );
    lastIndex = index + 1;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span>{parts}</span>;
};

export const TabItem = forwardRef(
  ({ result, isSelected, onClick, onMouseEnter }, ref) => {
    const { tab, displayUrl } = result;

    const displayTitle = tab.title || "Untitled";

    return (
      <div
        ref={ref}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        class={`flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2 transition-colors last:border-b-0 ${isSelected ? "bg-selection hover:bg-selection" : "hover:bg-muted"} `}
      >
        <img
          src={
            tab.favIconUrl ||
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
          }
          alt=""
          class="h-4 w-4 shrink-0 drop-shadow-sm"
        />
        <div class="min-w-0 flex-1">
          <div class="mb-0.5 truncate text-xs font-medium">
            <HighlightedText
              text={displayTitle}
              matches={result.titleMatch?.matches || []}
            />
            {tab.audible && " 🔊"}
          </div>
          <div class="truncate text-xs text-muted-foreground">
            <HighlightedText
              text={displayUrl}
              matches={result.urlMatch?.matches || []}
            />
          </div>
        </div>
      </div>
    );
  },
);
