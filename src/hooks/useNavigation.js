import { useSignal, useSignalEffect } from '@preact/signals';

export function useNavigation(resultsSignal, onSelect) {
  const selectedIndex = useSignal(0);

  useSignalEffect(() => {
    if (resultsSignal.value.length > 0 && selectedIndex.value >= resultsSignal.value.length) {
      selectedIndex.value = 0;
    }
  });

  const handleKeyDown = (e) => {
    const len = resultsSignal.value.length;
    if (len === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex.value = (selectedIndex.value + 1) % len;
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex.value = (selectedIndex.value - 1 + len) % len;
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          selectedIndex.value = (selectedIndex.value - 1 + len) % len;
        } else {
          selectedIndex.value = (selectedIndex.value + 1) % len;
        }
        break;
      case 'Enter':
        e.preventDefault();
        onSelect(resultsSignal.value[selectedIndex.value]);
        break;
    }
  };

  return {
    selectedIndex,
    handleKeyDown
  };
}
