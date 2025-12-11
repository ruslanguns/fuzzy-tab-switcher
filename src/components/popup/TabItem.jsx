import { forwardRef } from 'preact/compat';
import { highlightText, formatUrl } from '../../utils/helpers';

export const TabItem = forwardRef(({ result, isSelected, onClick, onMouseEnter }, ref) => {
  const { tab, match, matchedIn } = result;
  const audioIndicator = tab.audible ? ' 🔊' : '';

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      class={`
        flex items-center gap-3 px-4 py-3 border-b border-[#2d2d2d] cursor-pointer transition-colors
        ${isSelected ? 'bg-[#094771] hover:bg-[#0e6198]' : 'hover:bg-[#2a2d2e]'}
      `}
    >
      <img
        src={tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'}
        alt=""
        class="w-4 h-4 flex-shrink-0"
      />
      <div class="flex-1 min-w-0">
        <div
          class="text-sm font-medium truncate mb-1"
          dangerouslySetInnerHTML={{
            __html: highlightText(
              tab.title || 'Untitled',
              matchedIn === 'title' ? match.matches : []
            ) + audioIndicator
          }}
        />
        <div
          class="text-xs text-[#858585] truncate"
          dangerouslySetInnerHTML={{
            __html: highlightText(
              formatUrl(tab.url),
              matchedIn === 'url' ? match.matches : []
            )
          }}
        />
      </div>
    </div>
  );
});
