import { signal, computed, effect } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { fuzzySearch } from '../../utils/fuzzy';
import { TabList } from './TabList';
import { Search } from './Search';

const allTabs = signal([]);
const query = signal('');
const selectedIndex = signal(0);
const tabAccessHistory = signal({});
const currentWindowId = signal(null);
const isLoading = signal(true);

const filteredResults = computed(() => {
  if (query.value) {
    return fuzzySearch(allTabs.value, query.value);
  }
  return sortByMRU(allTabs.value, tabAccessHistory.value);
});

function sortByMRU(tabs, history) {
  return tabs
    .map(tab => ({
      tab,
      match: { score: 0, matches: [] },
      matchedIn: 'title',
      lastAccess: history[tab.id] || 0,
    }))
    .sort((a, b) => {
      if (a.tab.active) return -1;
      if (b.tab.active) return 1;
      return b.lastAccess - a.lastAccess;
    });
}

async function cleanupHistory(tabs, history) {
  const validTabIds = new Set(tabs.map(tab => tab.id));
  const cleaned = {};

  for (const [tabId, timestamp] of Object.entries(history)) {
    if (validTabIds.has(parseInt(tabId))) {
      cleaned[tabId] = timestamp;
    }
  }

  if (Object.keys(cleaned).length !== Object.keys(history).length) {
    await chrome.storage.local.set({ tabAccessHistory: cleaned });
    return cleaned;
  }

  return history;
}

async function refreshTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    const cleanedHistory = await cleanupHistory(tabs, tabAccessHistory.value);
    allTabs.value = tabs;
    tabAccessHistory.value = cleanedHistory;
  } catch (error) {
    console.error('Failed to refresh tabs:', error);
  }
}

async function recordTabAccess(tabId) {
  const newHistory = { ...tabAccessHistory.value, [tabId]: Date.now() };
  tabAccessHistory.value = newHistory;
  await chrome.storage.local.set({ tabAccessHistory: newHistory });
}

async function switchToTab(index) {
  const results = filteredResults.value;
  if (results.length === 0 || !results[index]) return;

  const { tab } = results[index];

  try {
    if (currentWindowId.value && tab.windowId !== currentWindowId.value) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }

    await chrome.tabs.update(tab.id, { active: true });
    await recordTabAccess(tab.id);
    window.close();
  } catch (error) {
    console.error('Failed to switch tab:', error);
    const tabs = await chrome.tabs.query({});
    allTabs.value = tabs;
  }
}

async function closeTab(index) {
  const results = filteredResults.value;
  if (results.length === 0 || !results[index]) return;

  const { tab } = results[index];

  try {
    await chrome.tabs.remove(tab.id);

    allTabs.value = allTabs.value.filter(t => t.id !== tab.id);

    const newHistory = { ...tabAccessHistory.value };
    delete newHistory[tab.id];
    tabAccessHistory.value = newHistory;
    await chrome.storage.local.set({ tabAccessHistory: newHistory });

    const newLength = filteredResults.value.length;
    if (selectedIndex.value >= newLength) {
      selectedIndex.value = Math.max(0, newLength - 1);
    }

    if (allTabs.value.length === 0) {
      window.close();
    }
  } catch (error) {
    console.error('Failed to close tab:', error);
  }
}

export function App() {
  const searchRef = useRef(null);

  useEffect(() => {
    async function init() {
      const [data, currentWindow] = await Promise.all([
        chrome.storage.local.get('tabAccessHistory'),
        chrome.windows.getCurrent(),
      ]);

      const history = data.tabAccessHistory || {};
      tabAccessHistory.value = history;

      await refreshTabs();
      currentWindowId.value = currentWindow.id;
      isLoading.value = false;

      searchRef.current?.focus();
    }
    init();
  }, []);

  useEffect(() => {
    if (!isLoading.value) {
      searchRef.current?.focus();
    }
  }, [isLoading.value]);

  useEffect(() => {
    const dispose = effect(() => {
      const maxIndex = filteredResults.value.length - 1;

      if (maxIndex < 0) {
        selectedIndex.value = 0;
        return;
      }

      if (selectedIndex.value > maxIndex) {
        selectedIndex.value = maxIndex;
      }
    });

    return () => dispose();
  }, []);

  useEffect(() => {
    function handleTabChange() {
      refreshTabs();
    }

    chrome.tabs.onCreated.addListener(handleTabChange);
    chrome.tabs.onUpdated.addListener(handleTabChange);
    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.tabs.onRemoved.addListener(handleTabChange);

    return () => {
      chrome.tabs.onCreated.removeListener(handleTabChange);
      chrome.tabs.onUpdated.removeListener(handleTabChange);
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.tabs.onRemoved.removeListener(handleTabChange);
    };
  }, []);

  function handleQueryChange(e) {
    query.value = e.target.value;
    selectedIndex.value = 0;
  }

  function handleSelectIndex(index) {
    selectedIndex.value = index;
  }

  function handleKeyDown(e) {
    const maxIndex = filteredResults.value.length - 1;

    switch (e.key) {
      case 'ArrowDown':
      case 'Down':
        e.preventDefault();
        selectedIndex.value = Math.min(selectedIndex.value + 1, maxIndex);
        break;
      case 'ArrowUp':
      case 'Up':
        e.preventDefault();
        selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
        } else {
          selectedIndex.value = Math.min(selectedIndex.value + 1, maxIndex);
        }
        break;
      case 'Enter':
        e.preventDefault();
        switchToTab(selectedIndex.value);
        break;
      case 'Escape':
        window.close();
        break;
      case 'Delete':
        e.preventDefault();
        closeTab(selectedIndex.value);
        break;
      case 'Backspace':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          closeTab(selectedIndex.value);
        }
        break;
    }
  }

  if (isLoading.value) {
    return (
      <div class="flex items-center justify-center h-screen bg-[#1e1e1e] text-[#d4d4d4]">
        Loading...
      </div>
    );
  }

  return (
    <div class="flex flex-col bg-[#1e1e1e] text-[#d4d4d4] min-h-screen">
      <Search
        ref={searchRef}
        value={query.value}
        onInput={handleQueryChange}
        onKeyDown={handleKeyDown}
      />
      <TabList
        results={filteredResults.value}
        selectedIndex={selectedIndex.value}
        onSelect={switchToTab}
        onHover={handleSelectIndex}
      />
    </div>
  );
}
