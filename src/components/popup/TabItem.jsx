import { forwardRef } from 'preact/compat';
const formatUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
};

const HighlightedText = ({ text, matches }) => {
  if (!matches || matches.length === 0) return <span>{text}</span>;

  const parts = [];
  let lastIndex = 0;

  matches.forEach((index, i) => {
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    parts.push(
      <span key={i} class="text-match font-bold">
        {text[index]}
      </span>
    );
    lastIndex = index + 1;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span>{parts}</span>;
}

export const TabItem = forwardRef(({ result, isSelected, onClick, onMouseEnter }, ref) => {
  const { tab, match, matchedIn } = result;

  const displayTitle = tab.title || 'Untitled';
  const displayUrl = formatUrl(tab.url);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      class={`
        flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer transition-colors
        ${isSelected ? 'bg-selection hover:bg-selection' : 'hover:bg-muted'}
      `}
    >
      <img
        src={tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'}
        alt=""
        class="w-4 h-4 shrink-0 drop-shadow-sm"
      />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate mb-1">
          <HighlightedText
            text={displayTitle}
            matches={matchedIn === 'title' ? match.matches : []}
          />
          {tab.audible && ' 🔊'}
        </div>
        <div class="text-xs text-muted-foreground truncate">
          <HighlightedText
            text={displayUrl}
            matches={matchedIn === 'url' ? match.matches : []}
          />
        </div>
      </div>
    </div>
  );
});
