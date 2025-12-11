import { useEffect, useRef } from 'preact/hooks';
import { TabItem } from './TabItem';

export function TabList({ results, selectedIndex, onSelect, onHover }) {
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (results.length === 0) {
    return (
      <div class="flex items-center justify-center py-10 text-[#858585]">
        No tabs found
      </div>
    );
  }

  return (
    <div class="flex-1 overflow-y-auto max-h-[488px] scrollbar-thin scrollbar-thumb-[#3e3e3e] scrollbar-track-[#1e1e1e]">
      {results.map((result, index) => (
        <TabItem
          key={result.tab.id}
          ref={index === selectedIndex ? selectedRef : null}
          result={result}
          isSelected={index === selectedIndex}
          onClick={() => {
            console.log('TabItem onClick, index:', index);
            onSelect(index);
          }}
          onMouseEnter={() => onHover(index)}
        />
      ))}
    </div>
  );
}
