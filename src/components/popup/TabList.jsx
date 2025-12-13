import { useEffect, useRef } from "preact/hooks";
import { TabItem } from "./TabItem";

export function TabList({ results, selectedIndex, onSelect, onHover }) {
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [selectedIndex]);

  if (results.length === 0) {
    return (
      <div class="flex items-center justify-center py-10 text-muted-foreground">
        No tabs found
      </div>
    );
  }

  return (
    <div class="max-h-[488px] flex-1 overflow-y-auto">
      {results.map((result, index) => (
        <TabItem
          key={result.tab.id}
          ref={index === selectedIndex ? selectedRef : null}
          result={result}
          isSelected={index === selectedIndex}
          onClick={() => onSelect(index)}
          onMouseEnter={() => onHover(index)}
        />
      ))}
    </div>
  );
}
