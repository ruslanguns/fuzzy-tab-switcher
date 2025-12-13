import { useSignal } from '@preact/signals';
import { useRef } from 'preact/hooks';
import { useTabs } from '../../hooks/useTabs';
import { useHistory } from '../../hooks/useHistory';
import { useNavigation } from '../../hooks/useNavigation';
import { useTheme } from '../../hooks/useTheme';
import { TabList } from './TabList';
import { Search } from './Search';
import { CommandHelp } from './CommandHelp';
import browser from 'webextension-polyfill';

export function App() {
  const searchRef = useRef(null);
  const isMouseActive = useRef(false);
  const query = useSignal('');
  
  const { history, recordAccess } = useHistory();
  const { theme, toggleTheme } = useTheme();

  const { filteredResults, isLoading, currentWindowId } = useTabs(query, history);

  const switchTab = async (item) => {
    if (!item) return;
    const { tab } = item;

    await recordAccess(tab.id);

    try {
      if (tab.windowId !== currentWindowId.value) {
        await browser.windows.update(tab.windowId, { focused: true });
      }
      await browser.tabs.update(tab.id, { active: true });
      window.close();
    } catch (err) {
      console.error(err);
    }
  };

  const { selectedIndex, handleKeyDown } = useNavigation(filteredResults, switchTab);

  const onKeyDown = (e) => {
    isMouseActive.current = false;
    handleKeyDown(e);
  };

  if (isLoading.value) {
    return (
      <div class="flex items-center justify-center h-screen bg-background text-muted-foreground p-4">
        Loading...
      </div>
    );
  }

  return (
    <div 
      class="flex flex-col h-full bg-background text-foreground w-[600px] max-h-[600px]"
      onMouseMove={() => isMouseActive.current = true}
    >
      <Search
        ref={searchRef}
        value={query.value}
        onInput={(e) => query.value = e.target.value}
        onKeyDown={onKeyDown}
      />
      <TabList
        results={filteredResults.value}
        selectedIndex={selectedIndex.value}
        onSelect={(idx) => switchTab(filteredResults.value[idx])}
        onHover={(idx) => {
          if (isMouseActive.current) {
            selectedIndex.value = idx;
          }
        }}
      />
      <CommandHelp theme={theme.value} onToggleTheme={toggleTheme} />
    </div>
  );
}
